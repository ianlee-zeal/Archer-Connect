export class Matter {
  id: number;
  name: string;

  public static toModel(item: any): Matter {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      name: item.name
    };
  }
}
