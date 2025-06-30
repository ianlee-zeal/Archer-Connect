import { ClaimSettlementLedger } from './claim-settlement-ledger';
import { ChartOfAccountSettings } from './chart-of-account-settings';
import { LedgerValues } from './ledger-values';

export class FormulaEngineParams {
  claimSettlementLedger: ClaimSettlementLedger;
  chartOfAccountSettings: ChartOfAccountSettings[];
  variables: any;
  recalc: boolean;
  initialLedgerValues: LedgerValues;
  paidStatusIds: number[];

  ledgerAmountPrecision: number;
  income: number;
  expenses: number;
  credits: number;
  balance: number;
  feeExpenses: number;
  grossAllocation: number;
  netAllocation: number;
  mdlTotal: number;
  cbfTotal: number;
  attorneyFeeTotal: number;
  attorneyExpensesTotal: number;
  lienTotal: number;
  archerFeeTotal: number;
  otherFeeTotal: number;
  thirdPartyPMTSTotal: number;
}
