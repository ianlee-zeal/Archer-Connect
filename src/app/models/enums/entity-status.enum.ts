//these must match the values in dbo.EntityStatus.Id field for correct sorting.
export enum EntityStatus {
  InactiveMedicalLienResolution = 1,
  ActiveMedicalLienResolution,
  HoldMedicalLienResolution,
  ActiveDeficiency,
  CuredDeficiency,
  LeadCase,
  ActiveCase,
  InactiveCase,
  CompleteCase,
  ActiveClient,
  InactiveClient,
  OnboardingCase = 12
}
