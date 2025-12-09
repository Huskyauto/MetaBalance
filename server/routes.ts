import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertWeightLogSchema, insertMealSchema, 
  insertFastingSessionSchema, insertChatMessageSchema 
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

const openai = process.env.AI_INTEGRATIONS_OPENAI_API_KEY 
  ? new OpenAI({ 
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
    })
  : null;

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";

function getFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes("weight") || message.includes("progress")) {
    return "Tracking your weight regularly is key to success! Remember, daily fluctuations are normal - focus on the weekly trend. Keep logging consistently and you'll see results.";
  }
  if (message.includes("fast") || message.includes("fasting")) {
    return "Intermittent fasting can be a powerful tool. Start with 16:8 if you're new - skip breakfast and eat between noon and 8pm. Stay hydrated during your fasting window!";
  }
  if (message.includes("calorie") || message.includes("eat") || message.includes("food")) {
    return "Focus on protein-rich foods to stay satisfied longer. Aim for lean meats, eggs, legumes, and Greek yogurt. Pair with plenty of vegetables for volume without many calories.";
  }
  if (message.includes("exercise") || message.includes("workout") || message.includes("active")) {
    return "Movement matters! Even a 20-minute walk daily can boost your metabolism and mood. Find activities you enjoy - consistency beats intensity.";
  }
  if (message.includes("motivation") || message.includes("struggling") || message.includes("hard")) {
    return "Everyone has tough days - that's completely normal! Focus on one small win today. You've already taken steps by being here. Progress isn't always linear, but you're moving forward.";
  }
  if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
    return "Hello! Great to see you. How can I help with your health goals today? I can assist with nutrition advice, fasting questions, or just provide some motivation.";
  }
  
  return "Great question! Remember, sustainable health changes come from consistent small habits. Focus on logging your meals, staying hydrated, and getting enough sleep. What specific area would you like to work on?";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ============ User Routes ============
  
  app.get("/api/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.patch("/api/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updated = await storage.updateUser(userId, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // ============ Weight Logs Routes ============
  
  app.get("/api/weight-logs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 30;
      const logs = await storage.getWeightLogs(userId, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get weight logs" });
    }
  });

  app.get("/api/weight-logs/latest", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const log = await storage.getLatestWeight(userId);
      res.json(log || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get latest weight" });
    }
  });

  app.post("/api/weight-logs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertWeightLogSchema.parse({ ...req.body, userId });
      const log = await storage.createWeightLog(data);
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create weight log" });
    }
  });

  // ============ Meals Routes ============
  
  app.get("/api/meals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date as string;
      if (date) {
        const meals = await storage.getMealsByDate(userId, date);
        return res.json(meals);
      }
      const limit = parseInt(req.query.limit as string) || 50;
      const meals = await storage.getMeals(userId, limit);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ error: "Failed to get meals" });
    }
  });

  app.get("/api/nutrition/:date", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const nutrition = await storage.getDailyNutrition(userId, req.params.date);
      res.json({
        ...nutrition,
        targets: {
          calories: user.dailyCalorieTarget,
          protein: user.dailyProteinTarget,
          carbs: user.dailyCarbsTarget,
          fat: user.dailyFatTarget,
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get nutrition" });
    }
  });

  app.post("/api/meals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertMealSchema.parse({ ...req.body, userId });
      const meal = await storage.createMeal(data);
      res.json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create meal" });
    }
  });

  app.delete("/api/meals/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteMeal(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meal" });
    }
  });

  // ============ Fasting Routes ============
  
  app.get("/api/fasting/active", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const session = await storage.getActiveFastingSession(userId);
      res.json(session || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get active session" });
    }
  });

  app.get("/api/fasting/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const sessions = await storage.getFastingSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get fasting history" });
    }
  });

  app.post("/api/fasting/start", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const active = await storage.getActiveFastingSession(userId);
      if (active) {
        return res.status(400).json({ error: "Already have an active fasting session" });
      }
      
      const data = insertFastingSessionSchema.parse({
        userId,
        protocol: req.body.protocol || user.preferredFastingProtocol,
        startTime: new Date(),
        targetDurationHours: req.body.targetDurationHours || 16,
      });
      
      const session = await storage.createFastingSession(data);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to start fasting session" });
    }
  });

  app.post("/api/fasting/:id/end", isAuthenticated, async (req: any, res) => {
    try {
      const session = await storage.endFastingSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to end fasting session" });
    }
  });

  // ============ Daily Goals Routes ============
  
  app.get("/api/goals/:date", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getDailyGoals(userId, req.params.date);
      
      if (!goals) {
        return res.json({
          date: req.params.date,
          goals: [
            { id: "1", text: "Log all meals", completed: false },
            { id: "2", text: "Drink 8 glasses of water", completed: false },
            { id: "3", text: "Complete fasting window", completed: false },
            { id: "4", text: "Stay under calorie target", completed: false },
            { id: "5", text: "Get 7+ hours of sleep", completed: false },
          ]
        });
      }
      
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to get daily goals" });
    }
  });

  app.put("/api/goals/:date", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goal = await storage.upsertDailyGoals({
        userId,
        date: req.params.date,
        goals: req.body.goals,
      });
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update daily goals" });
    }
  });

  // ============ Streak Routes ============
  
  app.get("/api/streak", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let streak = await storage.getStreak(userId);
      if (!streak) {
        streak = await storage.updateStreak(userId, {
          currentStreak: 0,
          longestStreak: 0,
        });
      }
      res.json(streak);
    } catch (error) {
      res.status(500).json({ error: "Failed to get streak" });
    }
  });

  app.post("/api/streak/update", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = new Date().toISOString().split('T')[0];
      const existingStreak = await storage.getStreak(userId);
      
      let newCurrentStreak = 1;
      let newLongestStreak = existingStreak?.longestStreak || 0;
      
      if (existingStreak?.lastActiveDate) {
        const lastDate = new Date(existingStreak.lastActiveDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          return res.json(existingStreak);
        } else if (diffDays === 1) {
          newCurrentStreak = (existingStreak.currentStreak || 0) + 1;
        }
      }
      
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }
      
      const streak = await storage.updateStreak(userId, {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: today,
      });
      
      res.json(streak);
    } catch (error) {
      res.status(500).json({ error: "Failed to update streak" });
    }
  });

  // ============ Chat Routes (AI Coach) ============
  
  app.get("/api/chat", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessages(userId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get chat messages" });
    }
  });

  app.post("/api/chat", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const userMessage = req.body.message;
      if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
      }
      
      await storage.createChatMessage({
        userId,
        role: "user",
        content: userMessage,
      });
      
      const latestWeight = await storage.getLatestWeight(userId);
      const streak = await storage.getStreak(userId);
      const today = new Date().toISOString().split('T')[0];
      const nutrition = await storage.getDailyNutrition(userId, today);
      const chatHistory = await storage.getChatMessages(userId, 10);
      
      const displayName = user.firstName || user.email?.split('@')[0] || 'there';
      
      const systemPrompt = `You are a supportive and knowledgeable health coach named Coach in the MetaBalance app. 
      
User Profile:
- Name: ${displayName}
- Current Weight: ${latestWeight?.weight || 'Not logged'} lbs
- Target Weight: ${user.targetWeight || 'Not set'} lbs
- Start Weight: ${user.startWeight || 'Not set'} lbs
- Current Streak: ${streak?.currentStreak || 0} days
- Today's Calories: ${nutrition.calories}/${user.dailyCalorieTarget}
- Today's Protein: ${nutrition.protein}g/${user.dailyProteinTarget}g

Your role is to:
1. Provide encouragement and motivation
2. Answer health and nutrition questions
3. Give practical weight loss and fasting advice
4. Celebrate progress and milestones
5. Help troubleshoot challenges

Keep responses concise (2-3 sentences max) and actionable. Be warm but professional.`;

      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPrompt },
        ...chatHistory.map(m => ({ 
          role: m.role as "user" | "assistant", 
          content: m.content 
        })),
        { role: "user", content: userMessage }
      ];

      let aiResponse = "I'm here to help with your health journey! What would you like to know about nutrition, fasting, or your progress?";
      
      if (openai) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            max_tokens: 150,
          });
          aiResponse = completion.choices[0]?.message?.content || aiResponse;
        } catch (aiError) {
          console.log("OpenAI error, using fallback response");
          aiResponse = getFallbackResponse(userMessage);
        }
      } else {
        aiResponse = getFallbackResponse(userMessage);
      }
      
      const savedResponse = await storage.createChatMessage({
        userId,
        role: "assistant",
        content: aiResponse,
      });
      
      res.json({ 
        userMessage: { role: "user", content: userMessage },
        assistantMessage: savedResponse 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  app.delete("/api/chat", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearChatHistory(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear chat history" });
    }
  });

  // ============ Food Search Routes (Spoonacular) ============
  
  app.get("/api/food/search", async (req, res) => {
    try {
      const query = req.query.query as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      if (!SPOONACULAR_API_KEY) {
        return res.json({
          results: [
            { id: 1, name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: "100g" },
            { id: 2, name: "Brown Rice", calories: 112, protein: 2.6, carbs: 24, fat: 0.9, servingSize: "100g" },
            { id: 3, name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingSize: "100g" },
          ]
        });
      }

      const response = await fetch(
        `${SPOONACULAR_BASE_URL}/food/ingredients/search?query=${encodeURIComponent(query)}&number=10&apiKey=${SPOONACULAR_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Spoonacular API error: ${response.status}`);
      }

      const data = await response.json();
      
      const results = await Promise.all(
        data.results.slice(0, 5).map(async (item: any) => {
          try {
            const nutritionResponse = await fetch(
              `${SPOONACULAR_BASE_URL}/food/ingredients/${item.id}/information?amount=100&unit=grams&apiKey=${SPOONACULAR_API_KEY}`
            );
            
            if (nutritionResponse.ok) {
              const nutritionData = await nutritionResponse.json();
              const nutrients = nutritionData.nutrition?.nutrients || [];
              
              const getAmount = (name: string) => {
                const nutrient = nutrients.find((n: any) => n.name.toLowerCase() === name.toLowerCase());
                return nutrient ? Math.round(nutrient.amount) : 0;
              };
              
              return {
                id: item.id,
                name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
                calories: getAmount("Calories"),
                protein: getAmount("Protein"),
                carbs: getAmount("Carbohydrates"),
                fat: getAmount("Fat"),
                servingSize: "100g",
              };
            }
            return null;
          } catch {
            return null;
          }
        })
      );

      res.json({ results: results.filter(Boolean) });
    } catch (error) {
      console.error("Food search error:", error);
      res.status(500).json({ error: "Failed to search food" });
    }
  });

  // ============ Dashboard Summary Route ============
  
  app.get("/api/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const today = new Date().toISOString().split('T')[0];
      const [latestWeight, streak, nutrition, weightLogs, activeSession] = await Promise.all([
        storage.getLatestWeight(userId),
        storage.getStreak(userId),
        storage.getDailyNutrition(userId, today),
        storage.getWeightLogs(userId, 30),
        storage.getActiveFastingSession(userId),
      ]);
      
      const daysActive = weightLogs.length > 0 
        ? Math.ceil((Date.now() - new Date(weightLogs[weightLogs.length - 1].createdAt!).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      const displayName = user.firstName || user.email?.split('@')[0] || 'User';
      
      res.json({
        user: {
          name: displayName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          targetWeight: user.targetWeight,
          startWeight: user.startWeight,
          dailyCalorieTarget: user.dailyCalorieTarget,
          dailyProteinTarget: user.dailyProteinTarget,
          dailyCarbsTarget: user.dailyCarbsTarget,
          dailyFatTarget: user.dailyFatTarget,
        },
        currentWeight: latestWeight?.weight || user.startWeight,
        streak: streak || { currentStreak: 0, longestStreak: 0 },
        nutrition: {
          current: nutrition,
          targets: {
            calories: user.dailyCalorieTarget,
            protein: user.dailyProteinTarget,
            carbs: user.dailyCarbsTarget,
            fat: user.dailyFatTarget,
          }
        },
        weightHistory: weightLogs.reverse(),
        daysActive,
        activeFasting: activeSession,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: "Failed to get dashboard data" });
    }
  });

  return httpServer;
}
