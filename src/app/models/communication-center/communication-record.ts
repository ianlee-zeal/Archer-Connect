/* eslint-disable import/no-cycle */
import moment from 'moment-timezone';
import { Document } from '@app/models/documents/document';
import { DateHelper } from '@app/helpers/date.helper';
import { CommunicationDirection } from './communication-direction';
import { CommunicationMethod } from './communication-method';
import { CommunicationPartyType } from './communication-party-type';
import { CommunicationSubject } from './communication-subject';
import { CommunicationResult } from './communication-result';
import { Auditable } from '../auditable';
import { IdValue } from '../idValue';
import { Note } from '../note';
import { EntityTypeEnum } from '../enums';
import { CommunicationLink } from '../communication-link';

export class CommunicationRecord extends Auditable {
  id: number;
  claimantId: number;
  claimant: string;
  claimantFirstName: string;
  claimantLastName: string;
  projectName: string;
  callerName: string;
  direction: CommunicationDirection;
  method: CommunicationMethod;
  partyType: CommunicationPartyType;
  partFirstName: string;
  partyLastName: string;
  subject: CommunicationSubject;
  otherSubject: string;
  result: CommunicationResult;
  otherResults: string;
  notes: Note[];
  relatedDocuments: Document[];
  relatedDocumentsCount: number;
  partyFullName: string;
  mailTrackingNumber: string;
  mailTrackingNumberTypeId: IdValue;
  startTime: Date | null;
  endTime: Date | null;
  relatedNotes: Note[];
  lastNoteText: string;
  archerId: number;
  entityTypeId: EntityTypeEnum;
  caseId: number | null;
  emailSubject: string;
  emailFrom: string;
  emailTo: string;
  emailBody: string;
  level: IdValue;
  escalationStatus: IdValue;
  attorneyReferenceId: string;
  callId: number;
  phoneNumber: string;

  constructor(model?: Partial<CommunicationRecord>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): CommunicationRecord {
    if (item) {
      return {
        ...super.toModel(item),
        archerId: item.archerId,
        claimantId: CommunicationRecord.getClaimantIdFromCommunicationLinks(item.communicationLinks),
        claimantFirstName: item.claimantFirstName,
        claimantLastName: item.claimantLastName,
        projectName: item.caseName,
        id: item.id,
        claimant: item.claimant,
        callerName: item.callerName,
        direction: CommunicationDirection.toModel(item.direction),
        method: CommunicationMethod.toModel(item.method),
        partyType: CommunicationPartyType.toModel(item.partyType),
        partFirstName: item.partFirstName,
        partyLastName: item.partyLastName,
        partyFullName: `${item.partFirstName || ''} ${item.partyLastName || ''}`,
        subject: CommunicationSubject.toModel(item.subject),
        result: CommunicationResult.toModel(item.result),
        notes: item.notes,
        relatedDocuments: item.relatedDocuments ? item.relatedDocuments.map((x: Document) => Document.toModel(x)) : null,
        relatedDocumentsCount: item.relatedDocumentsCount || 0,
        mailTrackingNumber: item.mailTrackingNumber,
        mailTrackingNumberTypeId: item.mailTrackingNumberType,
        startTime: DateHelper.toLocalDate(item.startTime),
        endTime: DateHelper.toLocalDate(item.endTime),
        otherSubject: item.otherSubject,
        otherResults: item.otherResults,
        relatedNotes: [],
        lastNoteText: item.lastNoteText,
        entityTypeId: item.entityTypeId,
        caseId: item.entityTypeId === EntityTypeEnum.Projects && item.communicationLinks ? item.communicationLinks[0]?.entityId : null,
        emailBody: item.emailBody,
        emailFrom: item.emailFrom,
        emailSubject: item.emailSubject,
        emailTo: item.emailTo,
        level: item.level,
        escalationStatus: item.escalationStatus,
        attorneyReferenceId: item.attorneyReferenceId,
        callId: item.callId,
        phoneNumber: item.phoneNumber,
      };
    }

    return null;
  }

  public static fromFormValue(entityType, entityId, formValue: any, id?: number): any {
    if (formValue) {
      return {
        id: id || 0,
        callId: +formValue.callId,
        phoneNumber: formValue.phoneNumber,
        entityType,
        entityId,
        claimant: formValue.claimant,
        callerName: formValue.callerName,
        directionId: +formValue.direction,
        methodId: +formValue.method,
        partyTypeId: +formValue.partyType,
        subjectId: +formValue.subject,
        resultId: +formValue.result,
        partyPhoneNumber: null,
        partyFirstName: null,
        partyLastName: null,
        otherSubject: formValue.otherSubject,
        otherResults: formValue.otherResult,
        notes: formValue.notes || null,
        mailTrackingNumber: formValue.mailTrackingNumber,
        mailTrackingNumberTypeId: formValue.trackingNumberType,
        notesUpdate: formValue.updateNotes,
        emailBody: formValue.emailBody,
        emailFrom: formValue.emailFrom,
        emailSubject: formValue.emailSubject,
        emailTo: formValue.emailTo,

        startTime: formValue.startDate && moment(formValue.startDate).isValid() ? moment(formValue.startDate).utc().toDate().toISOString() : null,
        endTime: formValue.endDate && moment(formValue.endDate).isValid() ? moment(formValue.endDate).utc().toDate().toISOString() : null,
      };
    }

    return null;
  }

  private static getClaimantIdFromCommunicationLinks(communicationLinks: CommunicationLink[]):number {
    if (!communicationLinks?.length) {
      return null;
    }
    const communicationLink = communicationLinks[0];

    return communicationLink.entityTypeId === EntityTypeEnum.Clients ? communicationLink.entityId : null;
  }
}
