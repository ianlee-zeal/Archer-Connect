export class AddressType {
  id: number;
  name: string;
  code: string;

  constructor(model?: Partial<AddressType>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): AddressType {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      code: item.code,
    };
  }
}
