/**
 * USHUS 2026: IMPERIUM — Pricing & Early Bird Engine (Workstream 2A)
 *
 * Rules:
 * - Base Fee: ₹1,500 per event entry across all 10 events.
 * - Early Bird Deadline: 30 September 2026, 23:59:59 IST.
 * - Early Bird Contingent (all 10 events): 50% discount -> ₹7,500 total (₹750/event).
 * - Early Bird Individual Event: 40% discount -> ₹900/event.
 * - Regular (post 30 Sept): ₹1,500/event (₹15,000 for 10 events).
 */

export const BASE_EVENT_FEE = 1500;
export const TOTAL_EVENTS_COUNT = 10;
export const EARLY_BIRD_DEADLINE = new Date("2026-09-30T23:59:59+05:30");

export type RegistrationType = "INDIVIDUAL_EVENT" | "CONTINGENT";

export interface PricingBreakdown {
  baseAmount: number;
  discountPercent: number;
  discountAmount: number;
  finalAmountDue: number;
  isEarlyBird: boolean;
  offerLabel: string;
}

/**
 * Returns true if the given date is before or at the early bird deadline.
 */
export function isEarlyBird(date: Date = new Date()): boolean {
  return date.getTime() <= EARLY_BIRD_DEADLINE.getTime();
}

/**
 * Calculates pricing, applicable discount percentage, and final amount due.
 *
 * @param registrationType "INDIVIDUAL_EVENT" or "CONTINGENT"
 * @param eventCount Number of events (defaults to 1 for individual, 10 for contingent)
 * @param date Current evaluation date (defaults to new Date())
 */
export function calculatePricing(
  registrationType: RegistrationType = "INDIVIDUAL_EVENT",
  eventCount: number = registrationType === "CONTINGENT" ? TOTAL_EVENTS_COUNT : 1,
  date: Date = new Date()
): PricingBreakdown {
  const activeEarlyBird = isEarlyBird(date);
  const baseAmount = BASE_EVENT_FEE * eventCount;

  let discountPercent = 0;
  let offerLabel = "Standard Pricing";

  if (activeEarlyBird) {
    if (registrationType === "CONTINGENT" && eventCount >= TOTAL_EVENTS_COUNT) {
      discountPercent = 50;
      offerLabel = "Early Bird: Contingent 50% Off (Valid till Sept 30)";
    } else {
      discountPercent = 40;
      offerLabel = "Early Bird: 40% Off (Valid till Sept 30)";
    }
  }

  const discountAmount = Math.round((baseAmount * discountPercent) / 100);
  const finalAmountDue = baseAmount - discountAmount;

  return {
    baseAmount,
    discountPercent,
    discountAmount,
    finalAmountDue,
    isEarlyBird: activeEarlyBird,
    offerLabel,
  };
}
