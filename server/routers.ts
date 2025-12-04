import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { callGrok } from "./grok";
import { z } from "zod";
import * as db from "./db";
import { calculateNutritionGoals } from "./nutritionGoals";
import { autocompleteIngredients, getIngredientNutrition } from "./spoonacular";
import { ensureProfileInitialized, getOwnerProfileDefaults } from "./profileInit";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      // Initialize profile with correct values for owner only (not test users)
      if (ctx.user.id === 1) {
        await ensureProfileInitialized(ctx.user.id, getOwnerProfileDefaults());
      }
      return await db.getMetabolicProfile(ctx.user.id);
    }),
    
    upsert: protectedProcedure
      .input(z.object({
        currentWeight: z.number().optional(),
        targetWeight: z.number().optional(),
        height: z.number().optional(),
        age: z.number().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        hasObesity: z.boolean().optional(),
        hasDiabetes: z.boolean().optional(),
        hasMetabolicSyndrome: z.boolean().optional(),
        hasNAFLD: z.boolean().optional(),
        currentMedications: z.string().optional(),
        takingGLP1: z.boolean().optional(),
        stressLevel: z.enum(["low", "moderate", "high"]).optional(),
        sleepQuality: z.enum(["poor", "fair", "good", "excellent"]).optional(),
        activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
        susceptibleToLinoleicAcid: z.boolean().optional(),
        lowNADLevels: z.boolean().optional(),
        poorGutHealth: z.boolean().optional(),
        primaryGoal: z.string().optional(),
        targetDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        console.log('[PROFILE UPDATE] User:', ctx.user.id, 'Data:', JSON.stringify(input));
        await db.upsertMetabolicProfile({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    // Get personalized nutrition goals
    getNutritionGoals: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getMetabolicProfile(ctx.user.id);
      
      if (!profile || !profile.currentWeight || !profile.height || !profile.age || !profile.gender || !profile.activityLevel) {
        // Return default goals if profile is incomplete
        return {
          dailyCalories: 2000,
          dailyProtein: 150,
          dailyCarbs: 200,
          dailyFats: 65,
          dailyFiber: 30,
        };
      }
      
      // Calculate goals based on profile
      const goals = calculateNutritionGoals({
        currentWeight: profile.currentWeight,
        height: profile.height,
        age: profile.age,
        gender: profile.gender,
        activityLevel: profile.activityLevel,
      });
      
      return goals;
    }),
  }),

  meals: router({
    // Get meals for a specific date
    getByDate: protectedProcedure
      .input(z.object({
        date: z.date(), // Get meals for this specific day
      }))
      .query(async ({ ctx, input }) => {
        return await db.getMealsByDate(ctx.user.id, input.date);
      }),
    
    // Get daily nutrition totals for a specific date
    getDailyTotals: protectedProcedure
      .input(z.object({
        date: z.date(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getDailyNutritionTotals(ctx.user.id, input.date);
      }),
    
    // Get weekly nutrition data for graphs
    getWeeklyData: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getWeeklyNutritionData(ctx.user.id, input.startDate, input.endDate);
      }),
    
    // Create a new meal entry
    create: protectedProcedure
      .input(z.object({
        loggedAt: z.date(),
        mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
        foodName: z.string(),
        servingSize: z.string().optional(),
        calories: z.number().optional(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fats: z.number().optional(),
        fiber: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createMealLog({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteMealLog(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  food: router({
    // Search for foods using Spoonacular API
    search: protectedProcedure
      .input(z.object({
        query: z.string(),
        limit: z.number().optional().default(10),
      }))
      .query(async ({ input }) => {
        return await autocompleteIngredients(input.query, input.limit);
      }),
    
    // Get nutrition data for a specific food
    getNutrition: protectedProcedure
      .input(z.object({
        ingredientId: z.number(),
        amount: z.number().optional().default(100),
        unit: z.string().optional().default("g"),
      }))
      .query(async ({ input }) => {
        return await getIngredientNutrition(input.ingredientId, input.amount, input.unit);
      }),
  }),

  fasting: router({
    getActive: protectedProcedure.query(async ({ ctx }) => {
      return await db.getActiveFastingSchedule(ctx.user.id);
    }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getFastingSchedules(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        fastingType: z.enum(["adf", "tre", "wdf"]),
        eatingWindowStart: z.number().optional(),
        eatingWindowEnd: z.number().optional(),
        fastingDays: z.string().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createFastingSchedule({
          userId: ctx.user.id,
          isActive: true,
          ...input,
        });
        return { success: true };
      }),
    
    logAdherence: protectedProcedure
      .input(z.object({
        scheduleId: z.number(),
        date: z.date(),
        adhered: z.boolean(),
        actualEatingStart: z.date().optional(),
        actualEatingEnd: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createFastingLog({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    getLogs: protectedProcedure
      .input(z.object({
        scheduleId: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getFastingLogs(ctx.user.id, input.scheduleId, input.startDate, input.endDate);
      }),
  }),

  supplements: router({
    listActive: protectedProcedure.query(async ({ ctx }) => {
      return await db.getActiveSupplements(ctx.user.id);
    }),
    
    listAll: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAllSupplements(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(["berberine", "probiotic", "nmn", "resveratrol", "other"]),
        dosage: z.string(),
        frequency: z.string(),
        timing: z.string().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createSupplement({
          userId: ctx.user.id,
          isActive: true,
          ...input,
        });
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
        timing: z.string().optional(),
        endDate: z.date().optional(),
        isActive: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await db.updateSupplement(id, ctx.user.id, updates);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteSupplement(input.id, ctx.user.id);
        return { success: true };
      }),
    
    logAdherence: protectedProcedure
      .input(z.object({
        supplementId: z.number(),
        takenAt: z.date(),
        adhered: z.boolean(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createSupplementLog({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    getLogs: protectedProcedure
      .input(z.object({
        supplementId: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getSupplementLogs(ctx.user.id, input.supplementId, input.startDate, input.endDate);
      }),
  }),

  progress: router({
    list: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getProgressLogs(ctx.user.id, input.startDate, input.endDate);
      }),
    
    latest: protectedProcedure.query(async ({ ctx }) => {
      return await db.getLatestProgressLog(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        loggedAt: z.date(),
        weight: z.number().optional(),
        waistCircumference: z.number().optional(),
        hipCircumference: z.number().optional(),
        chestCircumference: z.number().optional(),
        energyLevel: z.enum(["very_low", "low", "moderate", "high", "very_high"]).optional(),
        mood: z.enum(["poor", "fair", "good", "excellent"]).optional(),
        sleepQuality: z.enum(["poor", "fair", "good", "excellent"]).optional(),
        photoFront: z.string().optional(),
        photoSide: z.string().optional(),
        photoBack: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createProgressLog({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  insights: router({
    getToday: protectedProcedure.query(async ({ ctx }) => {
      // Check if we already have today's insight
      const existingInsight = await db.getTodayInsight(ctx.user.id);
      if (existingInsight) {
        return existingInsight;
      }

      // Generate new daily insight using Grok
      const profile = await db.getMetabolicProfile(ctx.user.id);
      const recentProgress = await db.getProgressLogs(ctx.user.id); // Recent progress
      // Get recent meals from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentMeals = await db.getWeeklyNutritionData(ctx.user.id, sevenDaysAgo, new Date());
      
      // Build context for Grok
      const firstWeight = recentProgress[0]?.weight;
      const lastWeight = recentProgress[recentProgress.length - 1]?.weight;
      const weightChange = recentProgress.length >= 2 && firstWeight != null && lastWeight != null
        ? firstWeight - lastWeight
        : 0;
      
      const context = `
User Profile:
- Current Weight: ${profile?.currentWeight || 'Not set'} lbs
- Target Weight: ${profile?.targetWeight || 'Not set'} lbs
- Weight to lose: ${profile?.currentWeight && profile?.targetWeight ? profile.currentWeight - profile.targetWeight : 'N/A'} lbs
- Recent weight change (7 days): ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} lbs
- Stress Level: ${profile?.stressLevel || 'unknown'}
- Sleep Quality: ${profile?.sleepQuality || 'unknown'}
- Activity Level: ${profile?.activityLevel || 'unknown'}
- Taking GLP-1: ${profile?.takingGLP1 ? 'Yes' : 'No'}
- Health conditions: ${[profile?.hasObesity && 'Obesity', profile?.hasDiabetes && 'Diabetes', profile?.hasMetabolicSyndrome && 'Metabolic Syndrome'].filter(Boolean).join(', ') || 'None reported'}

Recent Activity:
- Progress logs in past week: ${recentProgress.length}
- Meals logged recently: ${recentMeals.length}
      `.trim();

      const prompt = `You are a supportive metabolic health coach helping someone on their weight loss and metabolic health journey. Based on their profile and recent activity, generate a brief, personalized daily insight (2-3 sentences max) that:

1. Acknowledges their current situation or recent progress
2. Provides one specific, actionable tip related to metabolic health, nutrition, or lifestyle
3. Offers encouragement and motivation

Focus on evidence-based advice about:
- Reducing linoleic acid / seed oils
- Intermittent fasting benefits
- Gut health and probiotics
- NAD+ and mitochondrial function
- Managing stress and sleep
- Staying consistent with tracking

${context}

Generate a warm, encouraging daily insight:`;

      try {
        const insightContent = await callGrok([
          { role: 'system', content: 'You are a knowledgeable, supportive metabolic health coach. Keep responses brief, actionable, and encouraging.' },
          { role: 'user', content: prompt }
        ]);

        // Save the generated insight
        const newInsight = await db.createDailyInsight({
          userId: ctx.user.id,
          title: "Today's Insight",
          content: insightContent,
          insightType: "motivation",
          date: new Date(),
        });

        return newInsight;
      } catch (error) {
        console.error('Failed to generate daily insight:', error);
        // Return a fallback insight if Grok fails
        const fallbackInsight = await db.createDailyInsight({
          userId: ctx.user.id,
          title: "Today's Insight",
          content: "Focus on reducing seed oils today and prioritize whole, unprocessed foods. Your body will thank you!",
          insightType: "tip",
          date: new Date(),
        });
        return fallbackInsight;
      }
    }),
    
    markViewed: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markInsightViewed(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  chat: router({
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return await db.getChatHistory(ctx.user.id, input.limit);
      }),
    
    sendMessage: protectedProcedure
      .input(z.object({ content: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // Save user message
        await db.createChatMessage({
          userId: ctx.user.id,
          role: "user",
          content: input.content,
        });
        
        // Get chat history for context
        const history = await db.getChatHistory(ctx.user.id, 10);
        
        // Get user profile for personalization
        const profile = await db.getMetabolicProfile(ctx.user.id);
        
        // Build context for AI
        let systemPrompt = `You are a knowledgeable and empathetic health coach specializing in obesity reversal and metabolic health. 
You provide evidence-based advice on diet, intermittent fasting, supplements, and lifestyle changes based on the latest research.
Be supportive, motivational, and practical in your responses.`;
        
        if (profile) {
          systemPrompt += `\n\nUser context:`;
          if (profile.currentWeight && profile.targetWeight) {
            systemPrompt += `\n- Current weight: ${profile.currentWeight} lbs, Target: ${profile.targetWeight} lbs`;
          }
          if (profile.primaryGoal) {
            systemPrompt += `\n- Primary goal: ${profile.primaryGoal}`;
          }
          if (profile.hasObesity) systemPrompt += `\n- Has obesity`;
          if (profile.hasDiabetes) systemPrompt += `\n- Has diabetes`;
          if (profile.takingGLP1) systemPrompt += `\n- Taking GLP-1 medication`;
        }
        
        // Build messages for Grok API
        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          { role: "system", content: systemPrompt },
        ];
        
        // Add recent history
        history.forEach((msg) => {
          messages.push({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          });
        });
        
        // Add current question
        messages.push({ role: "user", content: input.content });
        
        // Call Grok API
        const aiResponse = await callGrok(messages);
        
        // Save AI response
        await db.createChatMessage({
          userId: ctx.user.id,
          role: "assistant",
          content: aiResponse,
        });
        
        return { response: aiResponse };
      }),
    
    clearHistory: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearChatHistory(ctx.user.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
