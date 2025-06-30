export class AccessPolicyType {
  id: number;
  name: string;
  description: string | null;

  public static toModel(item: any): AccessPolicyType {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        description: item.description,
      };
    }

    return null;
  }
}
