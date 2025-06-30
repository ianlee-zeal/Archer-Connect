export class ElectronicDelivery {
  externalStatus: string;
  electronicDeliveryProviderAccountId: number;

  public static toModel(item: any): ElectronicDelivery | null {
    if (item) {
      return {
        externalStatus: item.externalStatus,
        electronicDeliveryProviderAccountId: item.electronicDeliveryProviderAccountId,
      };
    }

    return null;
  }
}
