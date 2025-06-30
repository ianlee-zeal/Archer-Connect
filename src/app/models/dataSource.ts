export class DataSource {
    name: string;
    system: string;
    location: string;
    id: string;
    lastModifiedDate: Date;

    constructor(model?: Partial<DataSource>) {
      Object.assign(this, model);
    }

    public static toModel(item: any): DataSource | null {
      if (item) {
        return {
            id: item.id,
            name: item.name,
            system: item.system,
            location: item.location,
            lastModifiedDate: item.lastModifiedDate,
        };
      }
      return null;
    }
  }