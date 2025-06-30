export class BatchActionFilter {
  batchActionId: number;
  filter: string;

  public static toModel(item: any): BatchActionFilter {
    if (!item) {
      return null;
    }

    return {
      batchActionId: item.batchActionId,
      filter: item.filter,
    };
  }
}

export interface BatchActionFilterDto {
  filter: string;
}
