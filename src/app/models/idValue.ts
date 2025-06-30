export class IdValue {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  static filterFromArray(options: IdValue[], id: number): IdValue {
    if (!!options && options.length > 0) {
      const selectedOptions = options?.filter(i => i.id === id);
      const option: IdValue = selectedOptions.length > 0 ? selectedOptions[0] : null;
      return option;
    }
    return null;
  }
}
