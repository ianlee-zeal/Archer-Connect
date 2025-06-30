export class RequestReviewOption {
  id?: number;
  entityTypeId?: number;
  clients: number;
  defenciencyTypeId: number;
  deficienciesTypeId: number;
  name: string;
  note: string;
  severe: boolean;
  bypass: string;
  blockType: string;

  public static toModel(item: any): RequestReviewOption {
    if (item) {
      return {
        clients: item.clients,
        entityTypeId: item.entityTypeId,
        defenciencyTypeId: item.defenciencyTypeId,
        deficienciesTypeId: item.deficienciesTypeId,
        name: item.name,
        note: item.note,
        severe: item.severe,
        bypass: item.bypass,
        blockType: item.blockType,
      };
    }
    return null;
  }

  public static toDto(item: RequestReviewOption): PaymentRequestReviewOptionDto {
    if (item) {
      return {
        clients: item.clients,
        entityTypeId: item.entityTypeId,
        defenciencyTypeId: item.defenciencyTypeId,
        deficienciesTypeId: item.deficienciesTypeId,
        name: item.name,
        note: item.note,
        severe: item.severe,
        bypass: item.bypass,
        blockType: item.blockType,
      };
    }
    return null;
  }
}

class PaymentRequestReviewOptionDto {
  clients: number;
  entityTypeId?: number;
  defenciencyTypeId: number;
  deficienciesTypeId: number;
  name: string;
  note: string;
  severe: boolean;
  bypass: string;
  blockType: string;
}
