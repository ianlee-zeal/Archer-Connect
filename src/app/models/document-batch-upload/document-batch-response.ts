import { DocumentBatch } from './document-batch';

export class DocumentBatchResponse {
  items: DocumentBatch[];
  totalRecordsCount: number;

  constructor(model?: Partial<DocumentBatchResponse>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): DocumentBatchResponse | null {
    if (item) {
      return {
        items: item.items.map((i: any) => DocumentBatch.toModel(i)),
        totalRecordsCount: item.totalRecordsCount,
      };
    }
    return null;
  }
}
