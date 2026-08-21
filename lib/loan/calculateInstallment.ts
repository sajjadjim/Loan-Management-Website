import { calculateTotalInterest } from "./calculateInterest";

export interface InstallmentScheduleItem {
  installmentNo: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalDue: number;
  paidAmount: number;
  remainingAmount: number;
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
}

export interface GenerateScheduleParams {
  principal: number;
  annualRatePercentage: number;
  durationMonths: number;
  totalInstallments: number;
  startDate: Date;
  frequency?: "DAILY" | "WEEKLY" | "MONTHLY";
  interestType?: "FLAT" | "REDUCING";
}

export function generateInstallmentSchedule({
  principal,
  annualRatePercentage,
  durationMonths,
  totalInstallments,
  startDate,
  frequency = "MONTHLY",
  interestType = "FLAT",
}: GenerateScheduleParams): InstallmentScheduleItem[] {
  const totalInterest = calculateTotalInterest({
    principal,
    annualRatePercentage,
    durationMonths,
    type: interestType,
  });

  const totalPayable = principal + totalInterest;
  const rawInstallmentAmount = totalPayable / totalInstallments;
  const roundedInstallment = Math.round(rawInstallmentAmount * 100) / 100;

  const rawPrincipalPerInstallment = principal / totalInstallments;
  const rawInterestPerInstallment = totalInterest / totalInstallments;

  const schedule: InstallmentScheduleItem[] = [];
  let accumulatedPrincipal = 0;
  let accumulatedInterest = 0;

  const currentDate = new Date(startDate);

  for (let i = 1; i <= totalInstallments; i++) {
    // Advance date based on frequency
    if (i > 1) {
      if (frequency === "DAILY") {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (frequency === "WEEKLY") {
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    let pAmount = Math.round(rawPrincipalPerInstallment * 100) / 100;
    let iAmount = Math.round(rawInterestPerInstallment * 100) / 100;

    // Handle last installment penny rounding adjustments
    if (i === totalInstallments) {
      pAmount = Math.round((principal - accumulatedPrincipal) * 100) / 100;
      iAmount = Math.round((totalInterest - accumulatedInterest) * 100) / 100;
    } else {
      accumulatedPrincipal += pAmount;
      accumulatedInterest += iAmount;
    }

    const itemDue = Math.round((pAmount + iAmount) * 100) / 100;

    schedule.push({
      installmentNo: i,
      dueDate: new Date(currentDate),
      principalAmount: pAmount,
      interestAmount: iAmount,
      totalDue: itemDue,
      paidAmount: 0,
      remainingAmount: itemDue,
      status: "PENDING",
    });
  }

  return schedule;
}
