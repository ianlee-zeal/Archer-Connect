export enum AuditBatchUploading {
  Approved=195,
  Denied=196,
  Ignored=197,
  CompletedWithErrors=198,
  Warning=199,
  Completed=200,
  Waiting=201,
  Running=202,
  CompletedInPreviewWithErrors=205,
  CompletedInPreview=206,
  RunningPreview=207,
  Failed=208,
}

export const AuditValidationResultTypes = {
  [AuditBatchUploading.Approved]: 'Approved',
  [AuditBatchUploading.Denied]: 'Denied',
  [AuditBatchUploading.Ignored]: 'Ignored',
  [AuditBatchUploading.CompletedWithErrors]: 'Error', /* 'Completed with Errors' */
  [AuditBatchUploading.Warning]: 'Warning',
  [AuditBatchUploading.Completed]: 'Success', /* 'Completed' */
  [AuditBatchUploading.Waiting]: 'Waiting',
  [AuditBatchUploading.Running]: 'Running',
  [AuditBatchUploading.CompletedInPreviewWithErrors]: 'Completed in Preview with Errors',
  [AuditBatchUploading.CompletedInPreview]: 'Completed in Preview',
  [AuditBatchUploading.RunningPreview]: 'Running Preview',
  [AuditBatchUploading.Failed]: 'Failed',
};
