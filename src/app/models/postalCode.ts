export class PostalCode {
    id: number;
    name: string;
    code: string;

    constructor(model?: Partial<PostalCode>) {
      Object.assign(this, model);
    }

    public static toModel(item: any): PostalCode | null {
      if (item) {
        return {
          id: item.id,
          name: item.name,
          code: item.providerCode
        };
      }
      return null;
    }
  }
