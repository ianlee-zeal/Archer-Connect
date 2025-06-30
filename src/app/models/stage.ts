export class Stage {
  id: number;
  name: string;
  isFinal: boolean;

  static toModel(item: any): Stage {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      isFinal: item.isFinal || false,
    };
  }
}
