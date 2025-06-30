export class DocumentImportSettings {
  createDeficiencies: boolean;

  constructor(model?: DocumentImportSettings) {
    Object.assign(this, model);
  }

  public static toModel(item: any): DocumentImportSettings {
    return {
      createDeficiencies: item.createDeficiencies,
    };
  }

  public static toDto(item: DocumentImportSettings): any {
    return {
      createDeficiencies: item.createDeficiencies,
    }
  }
}
