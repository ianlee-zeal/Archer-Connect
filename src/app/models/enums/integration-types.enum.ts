export enum IntegrationTypes {
    DeficiencyReport = 6,
    LienStatusReport = 7,
    MDWExport = 8,
}

export const IntegrationTypesValues =  {
    [IntegrationTypes.DeficiencyReport]:  'Deficiency Report',
    [IntegrationTypes.LienStatusReport]:  'Lien Status Report',
    [IntegrationTypes.MDWExport]: 'Disbursement Worksheet Export',
}
