export class RecentView {
  userId: number;
  entityId: number;
  entityTypeId: number;
  name: string;
  url: string;
  createdDate: Date;

  constructor(model?: Partial<RecentView>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): RecentView {
    return {
      userId: item.userId,
      entityId: item.entityId,
      entityTypeId: item.entityTypeId,
      name: item.name ? `${item.name} (${item.entityId})` : null,
      url: item.url,
      createdDate: new Date(item.logDate),
    };
  }

  public static toDto(item: RecentView) {
    return {
      entityId: item.entityId,
      entityTypeId: item.entityTypeId,
      url: item.url
    };
  }
}
