import { FileImportReviewTabs } from '../enums';
import { ResultLineItemDeleted } from './result-line-item-deleted';
import { ValidationResultsLineItem } from './validation-results-line-item';

export class ValidationResults {
  deletedList: ResultLineItemDeleted[];
  rows: ValidationResultsLineItem[];
  message: string;
  enqueuedCount: number;
  totalCount: number;
  warningCount: number;
  errorCount: number;
  deletedCount: number;

  constructor(model?: Partial<ValidationResults>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ValidationResults {
    return {
      deletedList: item.deletedList,
      rows: item.rows.map(ValidationResultsLineItem.toModel),
      message: item.message,
      enqueuedCount: item.enqueuedCount,
      totalCount: item.totalCount,
      warningCount: item.warningCount,
      errorCount: item.errorCount,
      deletedCount: item.deletedCount,
    };
  }

  public static toPreviewModel(item: any): ValidationResults {
    return {
      deletedList: item.deletedList,
      rows: item.Rows,
      message: item.Message,
      enqueuedCount: item.EnqueuedCount,
      totalCount: item.TotalCount,
      warningCount: item.WarningCount,
      errorCount: item.ErrorCount,
      deletedCount: item.deletedCount,
    };
  }

  public static getCount(item: ValidationResults, tab: FileImportReviewTabs): number {
    switch (tab) {
      case FileImportReviewTabs.Errors:
        return item.errorCount;
      case FileImportReviewTabs.Warnings:
        return item.warningCount;
      case FileImportReviewTabs.Queued:
        return item.enqueuedCount;
      case FileImportReviewTabs.Deleted:
        return item.deletedCount;
      default:
        return item.totalCount;
    }
  }
}
