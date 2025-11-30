import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
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
  it("creates a meal with valid data", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.meals.create({
      loggedAt: new Date(),
      mealType: "breakfast",
      description: "Oatmeal with berries",
      containsSoybeanOil: false,
      containsCornOil: false,
      containsSunflowerOil: false,
      highLinoleicAcid: false,
      isProcessedFood: false,
      fiberContent: "high",
      notes: "Felt great after this meal",
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
        description: "Test meal",
        containsSoybeanOil: false,
        containsCornOil: false,
        containsSunflowerOil: false,
        highLinoleicAcid: false,
        isProcessedFood: false,
        fiberContent: "moderate",
      })
    ).rejects.toThrow();
  });
});

describe("meals.list", () => {
  it("returns an array of meals", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.meals.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});
