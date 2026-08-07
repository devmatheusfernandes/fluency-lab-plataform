import { describe, expect, it } from "vitest";
import { normalizeFinanceDate } from "../finance.utils";

describe("normalizeFinanceDate", () => {
  it("preserves the calendar day for ISO timestamps in UTC", () => {
    const normalized = normalizeFinanceDate("2026-08-15T00:00:00.000Z");
    expect(normalized?.getFullYear()).toBe(2026);
    expect(normalized?.getMonth()).toBe(7);
    expect(normalized?.getDate()).toBe(15);
  });

  it("preserves the calendar day for Date objects", () => {
    const normalized = normalizeFinanceDate(new Date("2026-08-15T00:00:00.000Z"));
    expect(normalized?.getDate()).toBe(15);
  });
});
