import { calculateTotalInterest } from "./calculateInterest";

export interface LoanSummaryDetails {
  principal: number;
  totalInterest: number;
  totalPayable: number;
  installmentAmount: number;
  totalInstallments: number;
  paidAmount: number;
  remainingAmount: number;
  progressPercentage: number;
}

export function computeLoanSummary(
  principal: number,
  annualRatePercentage: number,
  durationMonths: number,
  totalInstallments: number,
  paidAmount: number = 0,
  interestType: "FLAT" | "REDUCING" = "FLAT"
): LoanSummaryDetails {
  const totalInterest = calculateTotalInterest({
    principal,
    annualRatePercentage,
    durationMonths,
    type: interestType,
  });

  const totalPayable = Math.round((principal + totalInterest) * 100) / 100;
  const installmentAmount = Math.round((totalPayable / totalInstallments) * 100) / 100;
  const remainingAmount = Math.max(0, Math.round((totalPayable - paidAmount) * 100) / 100);
  const progressPercentage = totalPayable > 0 ? Math.min(100, Math.round((paidAmount / totalPayable) * 100)) : 0;

  return {
    principal,
    totalInterest,
    totalPayable,
    installmentAmount,
    totalInstallments,
    paidAmount,
    remainingAmount,
    progressPercentage,
  };
}
