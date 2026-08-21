/**
 * Centralized Interest Calculation Module
 * All calculations preserve exact financial precision using Decimal numbers.
 */

export interface CalculateInterestParams {
  principal: number;
  annualRatePercentage: number;
  durationMonths: number;
  type?: "FLAT" | "REDUCING";
}

export function calculateTotalInterest({
  principal,
  annualRatePercentage,
  durationMonths,
  type = "FLAT",
}: CalculateInterestParams): number {
  if (principal <= 0 || annualRatePercentage < 0 || durationMonths <= 0) {
    return 0;
  }

  if (type === "FLAT") {
    // Flat Interest = Principal * (Rate / 100) * (Months / 12)
    const annualInterest = principal * (annualRatePercentage / 100);
    const totalInterest = annualInterest * (durationMonths / 12);
    return Math.round(totalInterest * 100) / 100;
  }

  // Reducing Balance Method
  const monthlyRate = annualRatePercentage / 12 / 100;
  if (monthlyRate === 0) return 0;

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
    (Math.pow(1 + monthlyRate, durationMonths) - 1);
  const totalPayable = emi * durationMonths;
  const totalInterest = totalPayable - principal;

  return Math.round(totalInterest * 100) / 100;
}
