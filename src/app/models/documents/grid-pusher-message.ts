import { FileImportETLStatusEnum } from '../enums';

// This class uses PascalCase naming because it accepts data inbound from Pusher. Pusher does not lowercase its naming like an outbound request from the API. Please do not change
export class GridPusherMessage {
  RowNo: number;
  StatusId: FileImportETLStatusEnum;
  CurrentPercentage: number;
  CurrentLoadedCount: number;
  CurrentValidatedCount: number;
  CurrentSuccessfulCount: number;
  Enqueued: number;
  Total: number;
  Inserted: number;
  Updated: number;
  NotUpdated: number;
  Deleted: number;
  Warned: number;
  Errored: number;
  Loaded: number;
  Successful: number;
  ErrorMessage: string;
  ResultDocId: number;
  PreviewDocId: number;

  constructor(model?: Partial<GridPusherMessage>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): GridPusherMessage {
    return {
      RowNo: item.RowNo,
      StatusId: item.StatusId,
      CurrentPercentage: item.CurrentPercentage,
      CurrentLoadedCount: item.CurrentLoadedCount,
      CurrentValidatedCount: item.CurrentValidatedCount,
      CurrentSuccessfulCount: item.CurrentSuccessfulCount,
      Enqueued: item.Enqueued,
      Total: item.Total,
      Inserted: item.Inserted,
      Updated: item.Updated,
      NotUpdated: item.NotUpdated,
      Deleted: item.Deleted,
      Warned: item.Warned,
      Errored: item.Errored,
      Loaded: item.Loaded,
      ErrorMessage: item.ErrorMessage,
      ResultDocId: item.ResultDocId,
      PreviewDocId: item.PreviewDocId,
      Successful: item.Successful,
    };
  }
}
