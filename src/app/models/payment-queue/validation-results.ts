import { LienPaymentStageValidationResultsLineItem } from './validation-results-line-item';

export class LienPaymentStageValidationResult {
  rows: LienPaymentStageValidationResultsLineItem[];
  message: string;
  enqueuedCount: number;
  totalCount: number;
  warningCount: number;
  errorCount: number;
  deletedCount: number;

  constructor(model?: Partial<LienPaymentStageValidationResult>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): LienPaymentStageValidationResult {
    return {
      rows: item.rows.map(LienPaymentStageValidationResultsLineItem.toModel),
      message: item.message,
      enqueuedCount: item.enqueuedCount,
      totalCount: item.totalCount,
      warningCount: item.warningCount,
      errorCount: item.errorCount,
      deletedCount: item.deletedCount,
    };
  }
}
