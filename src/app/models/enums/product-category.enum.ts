export enum ProductCategory {
  MedicalLiens = 1,
  Bankruptcy = 2,
  Probate = 3,
  Release = 4,
  PresettlementServices = 11,
  ClaimsAdministration = 12,
  QSFAdministration = 13,
  GovernmentBenefitPreservation = 14,
  ReleaseAdmin = 15,
  ClaimantLocationAndInvestigation = 16,
  All = 17,
  ProbateService = 19,
}

export const ProductCategoryValues = {
  [ProductCategory.MedicalLiens]: 'Lien Resolution',
  [ProductCategory.Bankruptcy]: 'Bankruptcy',
  [ProductCategory.Probate]: 'Probate',
  [ProductCategory.Release]: 'Release Admin',
  [ProductCategory.QSFAdministration]: 'QSF',
}