export class LienPhase {
  id: number;
  name: string;
  shortName: string;
  hexColor: string;
  lienCount: number;


public static toModel(item: any): LienPhase {
  return {
    id: item.id,
    name: item.name,
    shortName: item.shortName || null ,
    hexColor: item.hexColor || null,
    lienCount: item.lienCount || null,
  };
}

}
