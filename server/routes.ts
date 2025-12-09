import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertWeightLogSchema, insertMealSchema, 
  insertFastingSessionSchema, insertChatMessageSchema 
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Demo user ID for development (in production, this would come from auth)
const DEMO_USER_ID = "demo-user";

// Fallback responses when OpenAI is not available
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
  
  // Initialize demo user if not exists
  app.use(async (req, res, next) => {
    const existingUser = await storage.getUser(DEMO_USER_ID);
    if (!existingUser) {
      try {
        await storage.createUser({
          username: "demo",
          password: "demo123",
          name: "Alex",
          targetWeight: 165,
          startWeight: 200,
          dailyCalorieTarget: 2000,
          dailyProteinTarget: 120,
          dailyCarbsTarget: 200,
          dailyFatTarget: 65,
          preferredFastingProtocol: "16:8",
        });
      } catch (e) {
        // User might already exist
      }
    }
    next();
  });

  // ============ User Routes ============
  
  app.get("/api/user", async (req, res) => {
    try {
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({
          username: "demo",
          password: "demo123",
          name: "Alex",
          targetWeight: 165,
          startWeight: 200,
          dailyCalorieTarget: 2000,
          dailyProteinTarget: 120,
          dailyCarbsTarget: 200,
          dailyFatTarget: 65,
          preferredFastingProtocol: "16:8",
        });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.patch("/api/user", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const updated = await storage.updateUser(user.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // ============ Weight Logs Routes ============
  
  app.get("/api/weight-logs", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const limit = parseInt(req.query.limit as string) || 30;
      const logs = await storage.getWeightLogs(user.id, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get weight logs" });
    }
  });

  app.get("/api/weight-logs/latest", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const log = await storage.getLatestWeight(user.id);
      res.json(log || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get latest weight" });
    }
  });

  app.post("/api/weight-logs", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const data = insertWeightLogSchema.parse({ ...req.body, userId: user.id });
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
  
  app.get("/api/meals", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const date = req.query.date as string;
      if (date) {
        const meals = await storage.getMealsByDate(user.id, date);
        return res.json(meals);
      }
      
      const limit = parseInt(req.query.limit as string) || 50;
      const meals = await storage.getMeals(user.id, limit);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ error: "Failed to get meals" });
    }
  });

  app.get("/api/nutrition/:date", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const nutrition = await storage.getDailyNutrition(user.id, req.params.date);
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

  app.post("/api/meals", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const data = insertMealSchema.parse({ ...req.body, userId: user.id });
      const meal = await storage.createMeal(data);
      res.json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create meal" });
    }
  });

  app.delete("/api/meals/:id", async (req, res) => {
    try {
      await storage.deleteMeal(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meal" });
    }
  });

  // ============ Fasting Routes ============
  
  app.get("/api/fasting/active", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const session = await storage.getActiveFastingSession(user.id);
      res.json(session || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get active session" });
    }
  });

  app.get("/api/fasting/history", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const limit = parseInt(req.query.limit as string) || 10;
      const sessions = await storage.getFastingSessions(user.id, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get fasting history" });
    }
  });

  app.post("/api/fasting/start", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      // Check if there's already an active session
      const active = await storage.getActiveFastingSession(user.id);
      if (active) {
        return res.status(400).json({ error: "Already have an active fasting session" });
      }
      
      const data = insertFastingSessionSchema.parse({
        userId: user.id,
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

  app.post("/api/fasting/:id/end", async (req, res) => {
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
  
  app.get("/api/goals/:date", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const goals = await storage.getDailyGoals(user.id, req.params.date);
      
      // Return default goals if none exist for this date
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

  app.put("/api/goals/:date", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const goal = await storage.upsertDailyGoals({
        userId: user.id,
        date: req.params.date,
        goals: req.body.goals,
      });
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update daily goals" });
    }
  });

  // ============ Streak Routes ============
  
  app.get("/api/streak", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      let streak = await storage.getStreak(user.id);
      if (!streak) {
        streak = await storage.updateStreak(user.id, {
          currentStreak: 0,
          longestStreak: 0,
        });
      }
      res.json(streak);
    } catch (error) {
      res.status(500).json({ error: "Failed to get streak" });
    }
  });

  app.post("/api/streak/update", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const today = new Date().toISOString().split('T')[0];
      const existingStreak = await storage.getStreak(user.id);
      
      let newCurrentStreak = 1;
      let newLongestStreak = existingStreak?.longestStreak || 0;
      
      if (existingStreak?.lastActiveDate) {
        const lastDate = new Date(existingStreak.lastActiveDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          // Already logged today
          return res.json(existingStreak);
        } else if (diffDays === 1) {
          // Consecutive day
          newCurrentStreak = (existingStreak.currentStreak || 0) + 1;
        }
        // else: streak broken, starts at 1
      }
      
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }
      
      const streak = await storage.updateStreak(user.id, {
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
  
  app.get("/api/chat", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessages(user.id, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get chat messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const userMessage = req.body.message;
      if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
      }
      
      // Save user message
      await storage.createChatMessage({
        userId: user.id,
        role: "user",
        content: userMessage,
      });
      
      // Get user context for AI
      const latestWeight = await storage.getLatestWeight(user.id);
      const streak = await storage.getStreak(user.id);
      const today = new Date().toISOString().split('T')[0];
      const nutrition = await storage.getDailyNutrition(user.id, today);
      
      // Get chat history for context
      const chatHistory = await storage.getChatMessages(user.id, 10);
      
      const systemPrompt = `You are a supportive and knowledgeable health coach named Coach in the MetaBalance app. 
      
User Profile:
- Name: ${user.name}
- Current Weight: ${latestWeight?.weight || 'Not logged'} lbs
- Target Weight: ${user.targetWeight} lbs
- Start Weight: ${user.startWeight} lbs
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

      // Generate AI response or use fallback
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
        // No OpenAI key configured, use intelligent fallbacks
        aiResponse = getFallbackResponse(userMessage);
      }
      
      // Save AI response
      const savedResponse = await storage.createChatMessage({
        userId: user.id,
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

  app.delete("/api/chat", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      await storage.clearChatHistory(user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear chat history" });
    }
  });

  // ============ Dashboard Summary Route ============
  
  app.get("/api/dashboard", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const today = new Date().toISOString().split('T')[0];
      const [latestWeight, streak, nutrition, weightLogs, activeSession] = await Promise.all([
        storage.getLatestWeight(user.id),
        storage.getStreak(user.id),
        storage.getDailyNutrition(user.id, today),
        storage.getWeightLogs(user.id, 30),
        storage.getActiveFastingSession(user.id),
      ]);
      
      // Calculate days active
      const daysActive = weightLogs.length > 0 
        ? Math.ceil((Date.now() - new Date(weightLogs[weightLogs.length - 1].createdAt!).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      res.json({
        user: {
          name: user.name,
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
