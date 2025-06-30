export enum AuditDataValidationFieldType {
  AuditedAmount = 1,
  LienProductId = 2,
  ServiceDate = 4,
  TreatmentDate = 8,
  Protocol = 16,
  ValidCodeSet = 32,
  IngestionDate = 64,
  InjuryDate = 128,
  SettlementDate = 256,
  StartingDateType = 512,
  Code = 2048,
  All = 32768,
}

export const AuditDataValidationFieldTypes = {
  [AuditDataValidationFieldType.AuditedAmount]: 'Audited Amount',
  [AuditDataValidationFieldType.LienProductId]: 'Lien Product Id',
  [AuditDataValidationFieldType.ServiceDate]: 'Service Date',
  [AuditDataValidationFieldType.TreatmentDate]: 'Treatment Date',
  [AuditDataValidationFieldType.Protocol]: 'Protocol',
  [AuditDataValidationFieldType.ValidCodeSet]: 'Valid Code Set',
  [AuditDataValidationFieldType.IngestionDate]: 'Ingestion Date',
  [AuditDataValidationFieldType.InjuryDate]: 'Injury Date',
  [AuditDataValidationFieldType.SettlementDate]: 'Settlement Date',
  [AuditDataValidationFieldType.StartingDateType]: 'Starting Date Type',
  [AuditDataValidationFieldType.Code]: 'Code',
  [AuditDataValidationFieldType.All]: 'All',
};

export const AuditDataValidationFieldEntityType = {
  [AuditDataValidationFieldType.AuditedAmount]: 'Claim',
  [AuditDataValidationFieldType.LienProductId]: 'Lien',
  [AuditDataValidationFieldType.ServiceDate]: 'Claim',
  [AuditDataValidationFieldType.TreatmentDate]: 'Lien',
  [AuditDataValidationFieldType.Protocol]: 'Lien',
  [AuditDataValidationFieldType.ValidCodeSet]: 'Lien',
  [AuditDataValidationFieldType.IngestionDate]: 'Lien',
  [AuditDataValidationFieldType.InjuryDate]: 'Lien',
  [AuditDataValidationFieldType.SettlementDate]: 'Lien',
  [AuditDataValidationFieldType.StartingDateType]: 'Lien',
  [AuditDataValidationFieldType.Code]: 'Lien',
};
