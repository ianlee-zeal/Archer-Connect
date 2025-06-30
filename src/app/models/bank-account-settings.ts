export class BankAccountSettings {
  allowedFileExtensions: string[];
  maxW9FileSizeInBytes: number;
  w9FileRequired: boolean;

  constructor(model?: Partial<BankAccountSettings>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): BankAccountSettings | null {
    if (item) {
      return {
        allowedFileExtensions: item.allowedFileExtensions,
        maxW9FileSizeInBytes: item.maxFileSizeInBytes,
        w9FileRequired: item.w9FileRequired,
      };
    }
    return null;
  }
}
