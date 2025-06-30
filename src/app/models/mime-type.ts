export class MimeType {
  id: number;

  name: string;

  mimeTypeValue: string;

  extension: string;

  constructor(model?: Partial<MimeType>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): MimeType | null {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        mimeTypeValue: item.mimeTypeValue,
        extension: item.extension,
      };
    }

    return null;
  }
}
