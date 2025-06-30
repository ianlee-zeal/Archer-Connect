export enum OverallInvoiceApprovalStatus {
  NoApprovals = 1,
  ARApproved = 2,
  QSFAdminApproved = 3,
  ReadyToInvoice = 4,
}

export const overallInvoiceApprovalStatusOptions = [
  { id: OverallInvoiceApprovalStatus.NoApprovals, name: 'No Approvals' },
  { id: OverallInvoiceApprovalStatus.ARApproved, name: 'AR Approved' },
  { id: OverallInvoiceApprovalStatus.QSFAdminApproved, name: 'QSF Admin Approved' },
  { id: OverallInvoiceApprovalStatus.ReadyToInvoice, name: 'Ready to Invoice' },
];
