export class InjuryCategory {
  id: number;
  tortId: number;
  name: string;
  description?: string;
  isNuisanceValue: string;

  public static toModel(item: any): InjuryCategory {
    if (!item) return null;

    return {
      id: item.id,
      tortId: item.tortId,
      name: item.name,
      description: item.description,
      isNuisanceValue: item.isNuisanceValue
    };
  }
}
