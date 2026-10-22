export interface LateFeeParams {
  dueDate: Date;
  currentDate?: Date;
  overdueAmount: number;
  gracePeriodDays?: number;
  dailyPenaltyPercentage?: number;
}

export function calculateLateFee({
  dueDate,
  currentDate = new Date(),
  overdueAmount,
  gracePeriodDays = 0,
  dailyPenaltyPercentage = 0,
}: LateFeeParams): { isOverdue: boolean; daysOverdue: number; lateFeeAmount: number } {
  if (overdueAmount <= 0) {
    return { isOverdue: false, daysOverdue: 0, lateFeeAmount: 0 };
  }

  const due = new Date(dueDate);
  const diffTime = currentDate.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

  if (diffDays <= gracePeriodDays) {
    return { isOverdue: false, daysOverdue: Math.max(0, diffDays), lateFeeAmount: 0 };
  }

  const effectiveOverdueDays = diffDays - gracePeriodDays;
  const lateFeeAmount = Math.round(
    overdueAmount * (dailyPenaltyPercentage / 100) * effectiveOverdueDays * 100
  ) / 100;

  return {
    isOverdue: true,
    daysOverdue: effectiveOverdueDays,
    lateFeeAmount,
  };
}
