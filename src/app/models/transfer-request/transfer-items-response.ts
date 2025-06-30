import { Transfer } from '../transfer';

export class TransferItemsResponse {
  items: Transfer[];
  amount: number;
  firstName: string;
  lastName: string;
  organizationName: string;
  caseName: string;
  processLogDocId?: number;
  additionalDocumentIds: number[];
  batchActionTemplateId: number;

  public static toModel(item: any): TransferItemsResponse {
    if (!item)
      return null;

    return {
      items: item.items.map(Transfer.toModel),
      amount: item.amount,
      firstName: item.firstName,
      lastName: item.lastName,
      organizationName: item.organizationName,
      caseName: item.caseName,
      processLogDocId: item?.processLogDocId,
      additionalDocumentIds: item.additionalDocumentIds,
      batchActionTemplateId: item.batchActionTemplateId,
    };
  }
}
