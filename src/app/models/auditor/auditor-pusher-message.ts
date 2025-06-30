// This class uses PascalCase naming because it accepts data inbound from Pusher. Pusher does not lowercase its naming like an outbound request from the API. Please do not change
export class AuditorPusherMessage {
  AuditRunId: number;
  ResultDocId: number;
  StatusId: number;
  ErrorMessage: string;
  TotalRowsCount: number;
  ProcessedRowsCount: number;
  SuccessCount: number;
  WarningsCount: number;
  ErrorsCount: number;

  constructor(model?: Partial<AuditorPusherMessage>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): AuditorPusherMessage {
    return {
      AuditRunId: item.AuditRunId,
      ResultDocId: item.ResultDocId,
      StatusId: item.StatusId,
      ErrorMessage: item.ErrorMessage,
      TotalRowsCount: item.TotalRowsCount,
      ProcessedRowsCount: item.ProcessedRowsCount,
      SuccessCount: item.SuccessCount,
      WarningsCount: item.WarningsCount,
      ErrorsCount: item.ErrorsCount,
    };
  }
}
