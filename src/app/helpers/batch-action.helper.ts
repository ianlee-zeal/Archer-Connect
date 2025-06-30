import { BatchAction } from "@app/models/batch-action/batch-action";
import { FileImportReviewTabs } from "@app/models/enums";
import { FileImportTab } from "@app/models/file-imports";

export class BatchActionHelper {
  static readonly allRecordsTabName = "All Records";
  static readonly errorsTabName = "Errors";
  static readonly warningsTabName = "Warnings";
  static readonly queuedTabName = "Queued";
  static readonly updatesTabName = "Updates";

  public static generateReviewTabsGroup(batchAction: BatchAction): FileImportTab[]
  {
    return [
      {
        tab: FileImportReviewTabs.AllRecords,
        title: this.allRecordsTabName,
        count: batchAction.countTotal,
      },
      {
        tab: FileImportReviewTabs.Errors,
        title: 'Errors',
        count: batchAction.countErrored,
      },
      {
        tab: FileImportReviewTabs.Warnings,
        title: this.warningsTabName,
        count: batchAction.countWarned,
      },
      {
        tab: FileImportReviewTabs.Queued,
        title: this.queuedTabName,
        count: batchAction.countSuccessful,
      },
    ];
  }

  public static generateResultTabsGroup(batchAction: BatchAction): FileImportTab[] {
    return [
      {
        tab: FileImportReviewTabs.AllRecords,
        title: this.allRecordsTabName,
        count: batchAction.countTotal,
      },
      {
        tab: FileImportReviewTabs.Updates,
        title: this.updatesTabName,
        count: batchAction.countSuccessful,
      },
      {
        tab: FileImportReviewTabs.Errors,
        title: this.errorsTabName,
        count: batchAction.countErrored,
      },
      {
        tab: FileImportReviewTabs.Warnings,
        title: this.warningsTabName,
        count: batchAction.countWarned,
      },
    ];
  }
}