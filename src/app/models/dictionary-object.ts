export abstract class DictionaryObject {
  id: number | string;
  name: string;
  code?: string;

  constructor(model?: Partial<DictionaryObject>) {
    Object.assign(this, model);
  }

  public static toModel(item): DictionaryObject {
    return {
      id: item.id,
      name: item.name,
      code: item.code,
    };
  }
}
