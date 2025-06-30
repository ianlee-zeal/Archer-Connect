// This class uses PascalCase naming because it accepts data inbound from Pusher. Pusher does not lowercase its naming like an outbound request from the API. Please do not change
export class LienFinalizationPusherMessage {
  readyDocumentId: number;
  Status: number;
  total: number;
  current: number;
  error: string;

  constructor(model?: Partial<LienFinalizationPusherMessage>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): LienFinalizationPusherMessage {
    return {
      readyDocumentId: item.readyDocumentId,
      Status: item.Status,
      total: item.total,
      current: item.current,
      error: item.e,
    };
  }
}
