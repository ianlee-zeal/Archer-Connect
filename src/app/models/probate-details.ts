/* eslint-disable import/no-cycle */
import { Claimant } from '@app/models/claimant';
import { DateHelper } from '@app/helpers/date.helper';
import { Product } from './liens/product';
import { Auditable } from './auditable';
import { IdValue } from './idValue';
import { User } from './user';
import { PersonContact } from './person-contact';
import { PacketRequest } from './packet-request';

export class ProbateDetails extends Auditable {
  id: number;
  dateOfDeath: Date;

  // Probate service information
  product: Product;
  productId: number;
  probateStageId: number;
  assignedToId: number;
  localCounselContactIds: number [];
  localCounselContacts: PersonContact [];
  privateCounselContactIds: number [];
  privateCounselContacts: PersonContact [];
  deathCertificateReceived: boolean;
  willProbated: boolean;
  decendentHaveAWill: boolean;
  estateOpened: boolean;
  documentsApproved: boolean;
  stage: IdValue;
  localCounselInvoice?: number;

  // Additional claimant information
  county: string;
  stateOfResidence: string;
  allocationAmount: string;
  newlyDeceased: boolean;

  // Important dates
  dateSentToProbateDept: Date;
  dateAssigned: Date;
  dateAllocationRecd: Date;
  dateNextFollowUp: Date;
  dateCompleted: Date;

  // New note
  note: string;

  // Payment Information
  disbursementGroupId: number;
  disbursementGroupName: string;

  // Invoicing
  invoiced: boolean;
  invoiceDate: Date;
  invoiceAmount: number;
  invoiceNumber: string;
  invoicedNotes: string;

  // Client data
  clientId: number;
  client: Claimant;

  statusId: number;
  status: IdValue;
  type: IdValue;

  assignedUser: User;

  resolution: string;
  stateOfAccident: string;
  releaseId: string;

  inactiveReasonId: number;
  inactiveDate: Date;
  inactiveReason: IdValue;
  packetRequests: PacketRequest[];

  constructor(model?: Partial<ProbateDetails>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item): ProbateDetails {
    if (!item) {
      return null;
    }

    return {
      ...super.toModel(item),
      id: item.id,
      clientId: item.clientId,
      client: Claimant.toModel(item.client),
      localCounselContactIds: item.localCounselContactIds,
      localCounselContacts: item.localCounselContacts,
      privateCounselContactIds: item.privateCounselContactIds,
      privateCounselContacts: item.privateCounselContacts,
      localCounselInvoice: item.localCounselInvoice,
      dateOfDeath: item.client?.dod ? new Date(item.client?.dod) : null,
      dateNextFollowUp: item.dateNextFollowUp ? new Date(item.dateNextFollowUp) : null,
      productId: item.productId,
      product: Product.toModel(item.product),
      stage: new IdValue(item.stage?.id, item.stage?.name),
      probateStageId: item.stageId,
      statusId: item.status?.id,
      status: new IdValue(item.status?.id, item.status?.name),
      assignedToId: item.assignedUserId,
      assignedUser: User.toModel(item.assignedUser),
      deathCertificateReceived: item.deathCertificateReceived,
      willProbated: item.willProbated,
      decendentHaveAWill: item.decendentHaveAWill,
      estateOpened: item.estateOpened,
      documentsApproved: item.documentsApproved,
      county: item.county,
      stateOfResidence: item.stateOfResidence,
      allocationAmount: item.allocation,
      newlyDeceased: item.newlyDeceased,
      dateSentToProbateDept: item.dateSentToProbateDept ? new Date(item.dateSentToProbateDept) : null,
      dateAssigned: item.dateAssigned ? new Date(item.dateAssigned) : null,
      dateAllocationRecd: item.dateAllocationReceived ? new Date(item.dateAllocationReceived) : null,
      dateCompleted: item.dateCompleted ? new Date(item.dateCompleted) : null,
      notes: item.notes,
      disbursementGroupId: item.disbursementGroupId,
      disbursementGroupName: item.disbursementGroup?.name,
      invoiced: item.invoiced,
      invoiceDate: item.invoicedDate ? new Date(item.invoicedDate) : null,
      invoicedNotes: item.invoicedNotes,
      invoiceAmount: item.fee,
      invoiceNumber: item.invoiceNumber,
      resolution: item.resolution,
      stateOfAccident: item.stateOfAccident,
      note: item.note,
      type: item.type,
      releaseId: item.releaseId,
      probateSPISyncedStatusId: item.probateSPISyncedStatusId,
      probateSPISyncedStatusName: item.probateSPISyncedStatusName,
      inactiveReasonId: item.inactiveReasonId,
      inactiveDate: item.inactiveDate ? new Date(item.inactiveDate) : null,
      inactiveReason: item.inactiveReason,
      packetRequests: item.packetRequests?.map((request: any) => PacketRequest.toModel(request)),
    } as ProbateDetails;
  }

  public static toDto(item: ProbateDetails) {
    return {
      id: item.id,
      clientId: item.clientId,
      localCounselContactIds: item.localCounselContactIds,
      privateCounselContactIds: item.privateCounselContactIds,
      dateNextFollowUp: DateHelper.toStringWithoutTime(item.dateNextFollowUp),
      productId: item.productId,
      product: Product.toDto(item.product),
      stageId: item.probateStageId,
      assignedUserId: item.assignedToId,
      deathCertificateReceived: item.deathCertificateReceived,
      willProbated: item.willProbated,
      decendentHaveAWill: item.decendentHaveAWill,
      estateOpened: item.estateOpened,
      documentsApproved: item.documentsApproved,
      county: item.county,
      stateOfResidence: item.stateOfResidence,
      fee: item.invoiceAmount,
      newlyDeceased: item.newlyDeceased,
      dateSentToProbateDept: DateHelper.toStringWithoutTime(item.dateSentToProbateDept),
      dateAssigned: DateHelper.toStringWithoutTime(item.dateAssigned),
      dateAllocationReceived: DateHelper.toStringWithoutTime(item.dateAllocationRecd),
      dateCompleted: DateHelper.toStringWithoutTime(item.dateCompleted),
      disbursementGroupId: item.disbursementGroupId,
      invoiced: item.invoiced,
      invoicedDate: DateHelper.toStringWithoutTime(item.invoiceDate),
      invoiceNumber: item.invoiceNumber,
      resolution: item.resolution,
      invoicedNotes: item.invoicedNotes,
      allocation: item.allocationAmount,
      note: item.note,
      releaseId: item.releaseId,
      personId: item.client?.personId,
      dateOfDeath: DateHelper.toStringWithoutTime(item.client?.dod),
      statusId: item.statusId,
      inactiveReasonId: item.inactiveReasonId,
      inactiveDate: DateHelper.toStringWithoutTime(item.inactiveDate),
      packetRequests: item.packetRequests?.map((request: PacketRequest) => PacketRequest.toDto(request)),
      localCounselInvoice: item.localCounselInvoice,
    };
  }
}
