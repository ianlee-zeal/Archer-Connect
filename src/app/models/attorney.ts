export class Attorney {
  id: number;
  orgId: number;
  firstName: string;
  lastName: string;
  email: string;

  public static toModel(item: any): Attorney {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      orgId: item.orgId,
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
    };
  }
}
