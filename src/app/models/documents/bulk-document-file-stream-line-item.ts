export class BulkDocumentFileStreamLineItem {
    type: string;
    name: string;
    message: string;
    valid: boolean;

    constructor(model?: BulkDocumentFileStreamLineItem) {
      Object.assign(this, model);
    }

    public static toModel(item: any): BulkDocumentFileStreamLineItem {
      return {
          type: item.type,
          name: item.name,
          message: item.message,
          valid: item.valid,
      };
    }
  }
