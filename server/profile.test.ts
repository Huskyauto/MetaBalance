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

describe("profile.upsert", () => {
  it("creates a new profile with valid data", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.upsert({
      currentWeight: 200,
      targetWeight: 160,
      height: 68,
      age: 35,
      gender: "male",
      hasObesity: true,
      hasDiabetes: false,
      hasMetabolicSyndrome: false,
      hasNAFLD: false,
      takingGLP1: false,
      stressLevel: "moderate",
      sleepQuality: "fair",
      activityLevel: "moderate",
      susceptibleToLinoleicAcid: true,
      lowNADLevels: false,
      poorGutHealth: false,
      primaryGoal: "Lose 40 lbs in 6 months",
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
      caller.profile.upsert({
        currentWeight: 200,
        targetWeight: 160,
        height: 68,
        age: 35,
        gender: "male",
        hasObesity: false,
        hasDiabetes: false,
        hasMetabolicSyndrome: false,
        hasNAFLD: false,
        takingGLP1: false,
        stressLevel: "moderate",
        sleepQuality: "fair",
        activityLevel: "moderate",
        susceptibleToLinoleicAcid: false,
        lowNADLevels: false,
        poorGutHealth: false,
      })
    ).rejects.toThrow();
  });
});

describe("profile.get", () => {
  it("returns undefined for users without a profile", async () => {
    const ctx = createAuthContext();
    ctx.user!.id = 99999; // Non-existent user
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.get();
    expect(result).toBeUndefined();
  });
});
