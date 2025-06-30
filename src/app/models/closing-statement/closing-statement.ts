/* eslint-disable import/no-cycle */
import { AddressLink } from '../address/address-link';
import { Email } from '../email';
import { Person } from '../person';
import { ElectronicDelivery } from './electronic-delivery'

export class ClosingStatement {
  isElectronicDeliveryEnabled: boolean;
  isPostalEnabled: boolean;
  electronicDeliveryProviderId?: number;
  electionFormRequired?: boolean;
  isReplaced: boolean;

  emailId?: number;
  addressId?: number;
  documentTemplateId?: number;
  documentTemplateName: string;
  clientId?: number;
  batchId?: number;
  caseId?: number;
  deliveryMethod: string;
  recipientId: number;
  recipientName: string;
  docuSignStatusName: string;
  electronicDelivery: ElectronicDelivery;

  email: Email;
  address: AddressLink;
  person: Person;

  public static toModel(item: any): ClosingStatement | null {
    if (item) {
      return {
        isElectronicDeliveryEnabled: item.isElectronicDeliveryEnabled,
        isPostalEnabled: item.isPostalEnabled,
        electronicDeliveryProviderId: item.electronicDeliveryProviderId,
        electionFormRequired: item.electionFormRequired,
        isReplaced: item.isReplaced,
        emailId: item.emailId,
        addressId: item.addressId,
        documentTemplateId: item.documentTemplateId,
        documentTemplateName: item.documentTemplateName,
        clientId: item.clientId,
        batchId: item.batchId,
        caseId: item.caseId,
        deliveryMethod: item.deliveryMethod,
        recipientId: item.recipientId,
        recipientName: item.recipientName,
        docuSignStatusName: item.electronicDelivery?.externalStatus,
        email: new Email(item.email),
        address: AddressLink.toModel(item.address),
        person: Person.toModel(item.person),
        electronicDelivery: ElectronicDelivery.toModel(item.electronicDelivery),
      };
    }

    return null;
  }
}
