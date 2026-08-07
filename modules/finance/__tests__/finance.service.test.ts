import { describe, expect, it } from "vitest";
import { calculateTeacherPayoutProjection, estimateAICostFromUsage } from "../finance.service";

describe("finance service projection helpers", () => {
  it("sums scheduled class payouts using teacher rate fallbacks", () => {
    const result = calculateTeacherPayoutProjection([
      { teacherHourlyRate: 5000 },
      { teacher: { teacherHourlyRate: 4200 } },
      { teacherHourlyRate: null, teacher: { teacherHourlyRate: 3900 } },
    ]);

    expect(result.classCount).toBe(3);
    expect(result.projectedAmount).toBe(13100);
  });

  it("estimates AI cost from usage metadata when available", () => {
    const result = estimateAICostFromUsage({
      modelName: "gemini-2.5-flash",
      usageMetadata: {
        promptTokenCount: 1000,
        candidateTokenCount: 500,
        totalTokenCount: 1500,
      },
    });

    expect(result).toBeGreaterThan(0);
  });
});
