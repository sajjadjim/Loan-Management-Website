export interface PaymentAllocationResult {
  paidAmount: number;
  newPaidTotal: number;
  newRemainingTotal: number;
  isFullyPaid: boolean;
}

export function calculatePaymentAllocation(
  currentPaid: number,
  totalPayable: number,
  paymentAmount: number
): PaymentAllocationResult {
  const newPaidTotal = Math.round((currentPaid + paymentAmount) * 100) / 100;
  const newRemainingTotal = Math.max(0, Math.round((totalPayable - newPaidTotal) * 100) / 100);
  const isFullyPaid = newRemainingTotal <= 0;

  return {
    paidAmount: paymentAmount,
    newPaidTotal,
    newRemainingTotal,
    isFullyPaid,
  };
}
