import { BulkDocumentFileStreamLineItem } from "./bulk-document-file-stream-line-item";

export class BulkDocumentFileStream {
  message?: string;
  rows?: BulkDocumentFileStreamLineItem[] = [];
  valid?: boolean;

  constructor(model?: BulkDocumentFileStream) {
    Object.assign(this, model);
  }

  public static toModel(item: any): BulkDocumentFileStream {
    return (item) ? {
      message: item.Message,
      rows: item.Rows,
      valid: item.Valid,
    } : {};
  }
}
