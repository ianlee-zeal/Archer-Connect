import { EntityAddress } from '..';
import { Email } from '../email';

export class PayeeItem {
  id: number;
  addressLink: EntityAddress;
  documentTemplateId: number;
  documentTemplate: any;
  electionFormRequired: boolean;
  isPostalEnabled: boolean;
  isElectronicEnabled: boolean;
  electronicDeliveryProvider: any;
  electronicDeliveryProviderId: number;
  sourceEntityTypeId: number;
  sourceEntityId: number;
  destinationEntityTypeId: number;
  destinationEntityId: number;
  addressLinkId: number;
  document: any;
  documentId: number;
  payeeName: string;
  payeeRole: string;
  email: Email;
  emailId: number;
  isPrimaryContact: boolean;
  willReceiveCS: boolean;

  public static toModel(item: any): PayeeItem {
    if (item) {
      return {
        id: item.id,
        addressLink: EntityAddress.toModel(item.addressLink),
        documentTemplateId: item.documentTemplateId,
        documentTemplate: item.documentTemplate,
        electionFormRequired: item.electionFormRequired,
        isPostalEnabled: item.isPostalEnabled,
        isElectronicEnabled: item.isElectronicEnabled,
        electronicDeliveryProviderId: item.electronicDeliveryProviderId,
        electronicDeliveryProvider: item.electronicDeliveryProvider,
        sourceEntityTypeId: item.sourceEntityTypeId,
        sourceEntityId: item.sourceEntityId,
        destinationEntityTypeId: item.destinationEntityTypeId,
        destinationEntityId: item.destinationEntityId,
        addressLinkId: item.addressLinkId,
        document: item.document,
        documentId: item.documentId,
        payeeName: item.payeeName,
        payeeRole: item.payeeRole,
        email: item.email,
        emailId: item.emailId,
        isPrimaryContact: !!item.isPrimaryContact,
        willReceiveCS: !!item.willReceiveCS
      };
    }
    return null;
  }
}
