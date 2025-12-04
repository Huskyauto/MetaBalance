import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 999999, // Test user ID to avoid overwriting real user data
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("meals.create", () => {
  it("creates a meal with nutrition data", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.meals.create({
      loggedAt: new Date(),
      mealType: "breakfast",
      foodName: "Oatmeal with berries",
      servingSize: "1 cup",
      calories: 300,
      protein: 10,
      carbs: 50,
      fats: 5,
      fiber: 8,
      notes: "Delicious and filling",
    });

    expect(result.success).toBe(true);
  });

  it("requires authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.meals.create({
        loggedAt: new Date(),
        mealType: "breakfast",
        foodName: "Test meal",
        calories: 100,
      })
    ).rejects.toThrow();
  });
});

describe("meals.getByDate", () => {
  it("returns meals for a specific date", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const today = new Date();
    const result = await caller.meals.getByDate({ date: today });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("meals.getDailyTotals", () => {
  it("calculates daily nutrition totals", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const today = new Date();
    const totals = await caller.meals.getDailyTotals({ date: today });
    
    expect(totals).toHaveProperty("calories");
    expect(totals).toHaveProperty("protein");
    expect(totals).toHaveProperty("carbs");
    expect(totals).toHaveProperty("fats");
    expect(totals).toHaveProperty("fiber");
    expect(typeof totals.calories).toBe("number");
  });
});

describe("meals.getWeeklyData", () => {
  it("returns weekly nutrition data", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const result = await caller.meals.getWeeklyData({
      startDate: weekAgo,
      endDate: today,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});
