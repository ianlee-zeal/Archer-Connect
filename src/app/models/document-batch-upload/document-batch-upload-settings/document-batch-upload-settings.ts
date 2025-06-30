import { IdValue } from "@app/models/idValue";

export class DocumentBatchUploadSettings {
  allowedFileExtensions: string[];
  maxNumFiles: number;
  maxFileSizeInBytes: number;
  departments: IdValue[];

  constructor(model?: Partial<DocumentBatchUploadSettings>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): DocumentBatchUploadSettings | null {
    if (item) {
      return {
        allowedFileExtensions: item.allowedFileExtensions,
        maxNumFiles: item.maxNumFiles,
        maxFileSizeInBytes: item.maxFileSizeInBytes,
        departments: item.departments,
      };
    }
    return null;
  }
}
