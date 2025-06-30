export class PinnedPage {
  userId: number;
  entityId: number;
  entityTypeId: number;
  name: string;
  url: string;
  createdDate: Date;

  constructor(model?: Partial<PinnedPage>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): PinnedPage {
    return {
      userId: item.userId,
      entityId: item.entityId,
      entityTypeId: item.entityTypeId,
      name: item.name ? `${item.name} (${item.entityId})` : null,
      url: item.url,
      createdDate: new Date(item.logDate),
    };
  }

  public static toDto(item: PinnedPage) {
    return {
      entityId: item.entityId,
      entityTypeId: item.entityTypeId,
      url: item.url
    };
  }
}
