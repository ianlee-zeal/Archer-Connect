export enum DeficiencyStatus {
  Cured = 'Cured',
  Active = 'Active',
}

export const DeficiencyStatusFilterValues =  {
  [DeficiencyStatus.Cured]:  'true',
  [DeficiencyStatus.Active]: 'false',
}
