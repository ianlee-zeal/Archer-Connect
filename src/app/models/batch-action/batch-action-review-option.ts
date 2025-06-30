export class BatchActionReviewOption {
  id?: number;
  clients: number;
  defenciencyTypeId: number;
  name: string;
  note: string;
  severe: boolean;
  deficiencyTypeProcessName: string;
  other: boolean;

  public static toModel(item: any): BatchActionReviewOption {
    if (item) {
      return {
        clients: item.clients,
        defenciencyTypeId: item.defenciencyTypeId,
        name: item.name,
        note: item.note,
        severe: item.severe,
        deficiencyTypeProcessName: item.deficiencyTypeProcessName,
        other: item.other,
      };
    }
    return null;
  }

  public static toDto(item: BatchActionReviewOption): BatchActionReviewOptionDto {
    if (item) {
      return {
        clients: item.clients,
        defenciencyTypeId: item.defenciencyTypeId,
        name: item.name,
        note: item.note,
        severe: item.severe,
        deficiencyTypeProcessName: item.deficiencyTypeProcessName,
      };
    }
    return null;
  }
}

class BatchActionReviewOptionDto {
  clients: number;
  defenciencyTypeId: number;
  name: string;
  note: string;
  severe: boolean;
  deficiencyTypeProcessName: string;
}
