import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { callGrok } from "./grok";

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
        await db.upsertMetabolicProfile({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  meals: router({
    list: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getMealLogs(ctx.user.id, input.startDate, input.endDate);
      }),
    
    create: protectedProcedure
      .input(z.object({
        loggedAt: z.date(),
        mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
        description: z.string(),
        containsSoybeanOil: z.boolean().default(false),
        containsCornOil: z.boolean().default(false),
        containsSunflowerOil: z.boolean().default(false),
        highLinoleicAcid: z.boolean().default(false),
        isProcessedFood: z.boolean().default(false),
        fiberContent: z.enum(["none", "low", "moderate", "high"]),
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
      return await db.getTodayInsight(ctx.user.id);
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
