export class DeficiencySummaryOption {
  id?: number;
  clients: number;
  defenciencyTypeId: number;
  name: string;
  note: string;
  severe: boolean;
  other: boolean;
  deficiencyTypeProcessName: string;

  public static toModel(item: any): DeficiencySummaryOption {
    if (item) {
      return {
        clients: item.clients,
        defenciencyTypeId: item.defenciencyTypeId,
        name: item.name,
        note: item.note,
        severe: item.severe,
        other: item.other,
        deficiencyTypeProcessName: item.deficiencyTypeProcessName,
      };
    }
    return null;
  }
}
