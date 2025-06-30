import { DateHelper } from '@app/helpers/date.helper';
import { Auditable } from './auditable';
import { Project } from './projects/project';
import { ClaimantIdentifier } from './claimant-identifiers';
import { Org } from './org';
import { Person } from './person';
import { Status } from './status';
import { ClientPaymentHold } from './client-payment-hold';

export class Claimant extends Auditable {
  id: number;
  attorneyReferenceId: string;
  project: Project;
  dob?: Date;
  dod?: Date;
  firstName: string;
  fullName: string;
  injuryDate?: Date;
  isPinned: boolean;
  lastName: string;
  org: Org;
  person: Person;
  personId?: number;
  settlementAmount: number;
  settlementFirmId: number;
  settlementFirmRefId: string;
  ssn: number;
  cleanSsn: number;
  status: Status;
  totalAllocation: number;
  archerId: number | null;
  externalIdentifiers: ClaimantIdentifier[];
  inactiveReason: Status;
  inactiveReasonId: number;
  inactiveDate: Date;
  finalizedDate: Date | null;
  systemFinalizedDate: Date | null;
  finalizedStatusName: string;
  clientPaymentHold: ClientPaymentHold;
  pin: string;
  designatedNotes: string;
  isActive: boolean;
  fundedDate: Date | null;

  constructor(model?: Partial<Project>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): Claimant {
    if (!item) {
      return null;
    }

    return {
      ...super.toModel(item),
      attorneyReferenceId: item.attorneyReferenceId,
      project: item.case,
      dob: item.dob,
      dod: item.dod,
      firstName: item.firstName,
      fullName: item.fullName,
      id: item.id,
      injuryDate: item.injuryDate,
      isPinned: item.isPinned,
      lastName: item.lastName,
      org: item.org,
      person: item.person,
      personId: item.personId,
      settlementAmount: item.settlementAmount,
      ssn: item.ssn,
      cleanSsn: item.cleanSsn,
      status: item.status,
      totalAllocation: item.totalAllocation,
      archerId: item.archerId,
      externalIdentifiers: item.externalIdentifiers,
      inactiveDate: item.inactiveDate,
      inactiveReason: item.inactiveReason,
      inactiveReasonId: item.inactiveReasonId,
      finalizedDate: item.finalizedDate,
      systemFinalizedDate: item.systemFinalizedDate,
      finalizedStatusName: item.finalizedStatusName,
      clientPaymentHold: item.holdTypeReason,
      settlementFirmId: item.settlementFirmId,
      settlementFirmRefId: item.settlementFirmRefId,
      pin: item.pin,
      designatedNotes: item.designatedNotes,
      isActive: item.isActive,
      fundedDate: item.fundedDate,
    };
  }

  public static toDto(item: Claimant) {
    return {
      ...super.toModel(item),
      attorneyReferenceId: item.attorneyReferenceId,
      case: item.project,
      dob: DateHelper.toStringWithoutTime(item.dob),
      dod: DateHelper.toStringWithoutTime(item.dod),
      firstName: item.firstName,
      fullName: item.fullName,
      id: item.id,
      injuryDate: item.injuryDate,
      isPinned: item.isPinned,
      lastName: item.lastName,
      org: item.org,
      person: item.person,
      personId: item.personId,
      settlementAmount: item.settlementAmount,
      ssn: item.ssn,
      cleanSsn: item.cleanSsn,
      status: item.status,
      totalAllocation: item.totalAllocation,
      archerId: item.archerId,
      externalIdentifiers: item.externalIdentifiers,
      inactiveDate: item.inactiveDate,
      inactiveReason: item.inactiveReason,
      inactiveReasonId: item.inactiveReasonId,
      finalizedDate: item.finalizedDate,
      systemFinalizedDate: item.systemFinalizedDate,
      finalizedStatusName: item.finalizedStatusName,
      holdTypeReason: item.clientPaymentHold,
      settlementFirmId: item.settlementFirmId,
      settlementFirmRefId: item.settlementFirmRefId,
      pin: item.pin,
      designatedNotes: item.designatedNotes,
      isActive: item.isActive,
      fundedDate: item.fundedDate,
    };
  }
}
