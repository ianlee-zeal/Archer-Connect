/* eslint-disable max-classes-per-file */

import { ChartOfAccount } from './chart-of-account';
import { ChartOfAccountMode } from '../projects';

export class ChartOfAccountSettings {
  active: boolean;
  projectId: number;
  caseId: number;
  chartOfAccountId: number;
  defaultPCT: number;
  defaultAmount: number;
  defaultModeId: number;
  paymentEnabled: boolean;
  disbursementModeId: number;
  includeInCostFirst: boolean;
  chartOfAccount: ChartOfAccount;
  chartOfAccountMode: ChartOfAccountMode;

  public static toModel(item): ChartOfAccountSettings {
    if (!item) {
      return null;
    }

    return <ChartOfAccountSettings>{
      active: item.active,
      projectId: item.projectId,
      caseId: item.caseId,
      chartOfAccountId: item.chartOfAccountId,
      defaultPCT: item.defaultPCT,
      defaultAmount: item.defaultAmount,
      defaultModeId: item.defaultModeId,
      paymentEnabled: item.paymentEnabled,
      includeInCostFirst: item.includeInCostFirst,
      disbursementModeId: item.disbursementModeId,
      chartOfAccountMode: item.chartOfAccountMode,

      chartOfAccount: ChartOfAccount.toModel(item.chartOfAccount)
    };
  }
}
