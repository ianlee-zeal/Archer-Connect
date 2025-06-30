export enum BKScrubProductCodeEnum {
  BankruptcySearchMonitoringOnly = 1,
  DeceasedSearchMonitoringOnly = 2,
  BankruptcyDesearchSearchMonitor = 4,
  DeleteAccountFromMonitoring = 99,
}

export const BKScrubProductCodeEnumText: Record<BKScrubProductCodeEnum, string> = {
  [BKScrubProductCodeEnum.BankruptcySearchMonitoringOnly]: 'Bankruptcy search and monitoring only',
  [BKScrubProductCodeEnum.DeceasedSearchMonitoringOnly]: 'Deceased search and monitoring only',
  [BKScrubProductCodeEnum.BankruptcyDesearchSearchMonitor]: 'Bankruptcy and Deceased search and monitoring',
  [BKScrubProductCodeEnum.DeleteAccountFromMonitoring]: 'Delete account from monitoring',
};

export const BKScrubProductCodeEnumSearchMapping: Record<BKScrubProductCodeEnum, string> = {
  [BKScrubProductCodeEnum.BankruptcySearchMonitoringOnly]: '01',
  [BKScrubProductCodeEnum.DeceasedSearchMonitoringOnly]: '02',
  [BKScrubProductCodeEnum.BankruptcyDesearchSearchMonitor]: '04',
  [BKScrubProductCodeEnum.DeleteAccountFromMonitoring]: '99',
};
