import { SettlementFinancialSummaryFlow } from './settlement-financial-summary-flow';
import { SettlementFinancialSummaryOverview } from './settlement-financial-summary-overview';
import { SettlementFinancialSummaryRow } from './settlement-financial-summary-row';
import { SettlementFinancialSummaryFlowRow } from './settlement-financial-summary-flow-row';

export class SettlementFinancialSummary {
  overview: SettlementFinancialSummaryOverview;
  totals: SettlementFinancialSummaryRow[];
  rows: SettlementFinancialSummaryRow[];
  totalRow: SettlementFinancialSummaryRow;
  inflows: SettlementFinancialSummaryFlow;
  outflows: SettlementFinancialSummaryFlow;
  efficiency:SettlementFinancialSummaryRow;
  netCashBookBal:SettlementFinancialSummaryFlowRow;
  bankBalance:number;
  unreconciledDifference:number;
}
