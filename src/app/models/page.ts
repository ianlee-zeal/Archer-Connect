export class Page<T> {
    totalRecordsCount: number;
    items: T[];

    constructor(model?: Page<T>) {
        Object.assign(this, model);
      }

      public static toModel(item: any): Page<any> {
        return {
            totalRecordsCount: item.totalRecordsCount,
            items: item.items
        };
      }

      public static toDto(item: Page<any>): any {
        return {
            totalRecordsCount: item.totalRecordsCount,
            items: item.items
        };
      }
}