export enum ClaimSettlementLedgerEntryStatus {
  Pending = 116,
  PaymentAuthorized = 117,
  Paid = 118,
  PartiallyPaid = 119,
  Void = 120,
  PaymentProcessing = 144,
  PartiallyProcessed = 147,
  NonPayable = 154,
  PaymentAuthorizedPartial = 307,
  Transferred = 331,
}

export const NonFinalizedStatus: number[] = [
  ClaimSettlementLedgerEntryStatus.NonPayable,
  ClaimSettlementLedgerEntryStatus.Pending,
  ClaimSettlementLedgerEntryStatus.Void,
];

export const PaidStatuses: number [] = [
  ClaimSettlementLedgerEntryStatus.PaymentProcessing,
  ClaimSettlementLedgerEntryStatus.PartiallyProcessed,
  ClaimSettlementLedgerEntryStatus.Paid,
  ClaimSettlementLedgerEntryStatus.PartiallyPaid,
];
