import { DateHelper } from '@app/helpers/date.helper';

export class Attachment {
  id: number;
  name: string;
  documentTypeId: number;
  fileContent: any;
  fileExtension: string;
  fileName: string;
  createdDate: Date;
  file: File;
  imageUrl: string;

  constructor(model?: Partial<Attachment>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): Attachment {
    return {
      id: item.id,
      name: `${item.name ?? item.fileName}.${item.fileExtension}`,
      documentTypeId: item.documentTypeId,
      fileContent: item.fileContent,
      fileExtension: item.fileExtension,
      fileName: `${item.fileName}.${item.fileExtension}`,
      createdDate: DateHelper.toLocalDate(item.createdDate),
      file: item.file,
      imageUrl: null
    };
  }
}
