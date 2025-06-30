export class PersonDuplicateList {
  duplicatePersonIds: number[] = [];
  properties: string[] = [];

  public hasProperty(propertyName: string): boolean {
    return this.properties.some(p => p.toLowerCase() === propertyName.toLowerCase());
  }

  public static toModel(item) {
    if (!item) return null;

    const model = new PersonDuplicateList();
    model.duplicatePersonIds = item.duplicatePersonIds ?? [];
    model.properties = item.properties ?? [];

    return model;
  }
}
