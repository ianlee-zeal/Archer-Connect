export class PaymentMethod {
    id: number;
    name: string;

    constructor(model?: Partial<PaymentMethod>) {
      Object.assign(this, model);
    }

    public static toModel(item: any): PaymentMethod | null {
      if (item) {
        return {
          id: item.id,
          name: item.name
        };
      }
      return null;
    }
  }