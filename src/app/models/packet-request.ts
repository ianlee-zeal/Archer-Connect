import { DateHelper } from '@app/helpers/date.helper';
import { AddressPipe } from '@app/modules/shared/_pipes/address.pipe';
import { Address, IdValue, Person } from '.';

export class PacketRequest {
  id: number;
  dateRequested: Date;
  statusId: number;
  status: IdValue;
  dateMailed: Date;
  dateReceived: Date;
  trackingNo: string;
  trackPacket: string;
  notes: string;
  productDetailsProbateId: number;
  packetRequestToProbateDocsToSends: PacketRequestToProbateDocsToSendDto[];
  packetRequestToProbateMissingDocs: PacketRequestToProbateMissingDocsDto[];
  packetRequestToProbateDocsToSendsIds: number[];
  packetRequestToProbateMissingDocsIds: number[];
  packetRequestToProbateDocsToSendsIdsDisplay: string;
  packetRequestToProbateMissingDocsIdsDisplay: string;
  documents: IdValue[];
  documentsIds: number[];
  clientContactId: number;
  // clientContact: PersonContact;

  clientContactModal: IdValue;
  clientContactName: string;
  clientContactFullName: string;
  clientContactInfo: Partial<Person>;
  clientContactAddress: string;

  public static toModel(item: any): PacketRequest {
    if (!item) {
      return null;
    }

    const clientContactFullName = Person.getFirstMiddleLastName(item.clientContact.person);
    const addressPipe: AddressPipe = new AddressPipe();

    return {
      id: item.id,
      dateRequested: item.dateRequested ? DateHelper.toLocalDate(item.dateRequested) : null,
      statusId: item.statusId,
      status: item.status,
      dateMailed: item.dateMailed ? DateHelper.toLocalDate(item.dateMailed) : null,
      dateReceived: item.dateReceived ? DateHelper.toLocalDate(item.dateReceived) : null,
      trackingNo: item.trackingNo,
      trackPacket: item.trackPacket,
      notes: item.notes,
      productDetailsProbateId: item.productDetailsProbateId,
      packetRequestToProbateDocsToSends: item.packetRequestToProbateDocsToSends,
      packetRequestToProbateMissingDocs: item.packetRequestToProbateMissingDocs,
      packetRequestToProbateDocsToSendsIds: item.packetRequestToProbateDocsToSends.map(d => d.probateDocsToSendId),
      packetRequestToProbateMissingDocsIds: item.packetRequestToProbateMissingDocs.map(d => d.probateMissingDocsId),
      packetRequestToProbateDocsToSendsIdsDisplay: item.packetRequestToProbateDocsToSends.map(d => d.probateDocsToSend.name).join(', '),
      packetRequestToProbateMissingDocsIdsDisplay: item.packetRequestToProbateMissingDocs?.map(d => d.probateMissingDocs.name).join(', '),
      documents: item.documents,
      documentsIds: item.documents?.map(d => d.id),
      // clientContact: item.clientContact,
      clientContactId: item.clientContactId,
      clientContactModal: new IdValue(item.clientContact?.id, item.clientContact.person?.fullName),
      clientContactName: item.clientContact.person?.fullName,
      clientContactFullName,
      clientContactInfo: {
        primaryAddress: item.clientContact.person?.primaryAddress,
        firstName: item.clientContact.person?.firstName,
        middleName: item.clientContact.person?.middleName,
        lastName: item.clientContact.person?.lastName,
      },
      clientContactAddress: addressPipe.transform(Address.toModel(item.clientContact.person?.primaryAddress)),
    };
  }

  public static toDto(item: PacketRequest): any {
    return {
      id: item.id,
      clientContactId: item.clientContactId,
      dateRequested: item.dateRequested ? DateHelper.fromLocalDateToUtcString(item.dateRequested) : null,
      statusId: item.statusId,
      dateMailed: item.dateMailed ? DateHelper.fromLocalDateToUtcString(item.dateMailed) : null,
      dateReceived: item.dateReceived ? DateHelper.fromLocalDateToUtcString(item.dateReceived) : null,
      trackingNo: item.trackingNo,
      trackPacket: item.trackPacket,
      notes: item.notes,
      productDetailsProbateId: item.productDetailsProbateId,
      packetRequestToProbateDocsToSends: item.packetRequestToProbateDocsToSends,
      packetRequestToProbateMissingDocs: item.packetRequestToProbateMissingDocs,
      documents: item.documents,
    };
  }

  public static beforeSave(items: PacketRequest[]) {
    if (!items) {
      return;
    }
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const packetRequestToProbateDocsToSends = [];
      if (item.packetRequestToProbateDocsToSendsIds) {
        for (let i = 0; i < item.packetRequestToProbateDocsToSendsIds?.length; i++) {
          const id = item.packetRequestToProbateDocsToSendsIds[i];
          const oldValue = item.packetRequestToProbateDocsToSends?.find(o => o.probateDocsToSendId === id);
          if (oldValue) {
            packetRequestToProbateDocsToSends.push({ ...oldValue });
          } else {
            packetRequestToProbateDocsToSends.push({
              id: 0,
              packetRequestId: item.id,
              probateDocsToSendId: id,
            });
          }
        }
      }
      item.packetRequestToProbateDocsToSends = packetRequestToProbateDocsToSends;

      const packetRequestToProbateMissingDocs = [];
      if (item.packetRequestToProbateMissingDocsIds) {
        for (let i = 0; i < item.packetRequestToProbateMissingDocsIds?.length; i++) {
          const id = item.packetRequestToProbateMissingDocsIds[i];
          const oldValue = item.packetRequestToProbateMissingDocs?.find(o => o.probateMissingDocsId === id);
          if (oldValue) {
            packetRequestToProbateMissingDocs.push({ ...oldValue });
          } else {
            packetRequestToProbateMissingDocs.push({
              id: 0,
              packetRequestId: item.id,
              probateMissingDocsId: id,
            });
          }
        }
      }
      item.packetRequestToProbateMissingDocs = packetRequestToProbateMissingDocs;
    }
  }
}

class PacketRequestToProbateDocsToSendDto {
  id: number;
  packetRequestId: number;
  probateDocsToSendId: number;
  packetRequest: PacketRequest;
  probateDocsToSend: IdValue;
}

class PacketRequestToProbateMissingDocsDto {
  id: number;
  packetRequestId: number;
  probateMissingDocsId: number;
  packetRequest: PacketRequest;
  probateMissingDocs: IdValue;
}
