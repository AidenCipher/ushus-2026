import { calculatePricing, isEarlyBird, EARLY_BIRD_DEADLINE, BASE_EVENT_FEE } from "@/lib/pricing";

describe("Pricing Engine — Workstream 2A", () => {
  describe("isEarlyBird", () => {
    it("returns true before the 30 September 2026 cutoff", () => {
      const dateBefore = new Date("2026-09-15T12:00:00+05:30");
      expect(isEarlyBird(dateBefore)).toBe(true);
    });

    it("returns true exactly at the 30 September 2026 cutoff", () => {
      expect(isEarlyBird(EARLY_BIRD_DEADLINE)).toBe(true);
    });

    it("returns false after the 30 September 2026 cutoff", () => {
      const dateAfter = new Date("2026-10-01T00:00:00+05:30");
      expect(isEarlyBird(dateAfter)).toBe(false);
    });
  });

  describe("calculatePricing during Early Bird", () => {
    const earlyDate = new Date("2026-09-20T10:00:00+05:30");

    it("calculates 40% discount for individual event registration (₹900 vs ₹1,500)", () => {
      const result = calculatePricing("INDIVIDUAL_EVENT", 1, earlyDate);
      expect(result.baseAmount).toBe(1500);
      expect(result.discountPercent).toBe(40);
      expect(result.discountAmount).toBe(600);
      expect(result.finalAmountDue).toBe(900);
      expect(result.isEarlyBird).toBe(true);
      expect(result.offerLabel).toContain("40% Off");
    });

    it("calculates 50% discount for contingent registration (₹7,500 vs ₹15,000 for 10 events)", () => {
      const result = calculatePricing("CONTINGENT", 10, earlyDate);
      expect(result.baseAmount).toBe(15000);
      expect(result.discountPercent).toBe(50);
      expect(result.discountAmount).toBe(7500);
      expect(result.finalAmountDue).toBe(7500);
      expect(result.isEarlyBird).toBe(true);
      expect(result.offerLabel).toContain("50% Off");
    });
  });

  describe("calculatePricing after Early Bird cutoff", () => {
    const postDate = new Date("2026-10-05T10:00:00+05:30");

    it("calculates 0% discount for individual event registration (₹1,500 full price)", () => {
      const result = calculatePricing("INDIVIDUAL_EVENT", 1, postDate);
      expect(result.baseAmount).toBe(1500);
      expect(result.discountPercent).toBe(0);
      expect(result.discountAmount).toBe(0);
      expect(result.finalAmountDue).toBe(1500);
      expect(result.isEarlyBird).toBe(false);
    });

    it("calculates 0% discount for contingent registration (₹15,000 full price)", () => {
      const result = calculatePricing("CONTINGENT", 10, postDate);
      expect(result.baseAmount).toBe(15000);
      expect(result.discountPercent).toBe(0);
      expect(result.discountAmount).toBe(0);
      expect(result.finalAmountDue).toBe(15000);
      expect(result.isEarlyBird).toBe(false);
    });
  });
});
