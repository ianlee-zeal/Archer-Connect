export class DigitalProviderStatus {
  id: number;
  entityTypeId: number;
  entityId: number;
  hasWallet: boolean;
  hasEnrolled: boolean;
  statusId: number;

  public static toModel(item: any): DigitalProviderStatus {
    if (item) {
      return {
        id: item.id,
        entityTypeId: item.entityTypeId,
        entityId: item.entityId,
        hasWallet: item.hasWallet,
        hasEnrolled: item.hasEnrolled,
        statusId: item.statusId,
      };
    }

    return null;
  }

  public static toDto(item: DigitalProviderStatus): any {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      entityTypeId: item.entityTypeId,
      entityId: item.entityId,
      hasWallet: item.hasWallet,
      hasEnrolled: item.hasEnrolled,
      statusId: item.statusId,
    };
  }
}
