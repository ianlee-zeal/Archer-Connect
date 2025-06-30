import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Document, DocumentLink, DocumentType } from '@app/models/documents';
import { EntityType } from '@app/models/entity-type';
import { CommunicationDirectionEnum, CommunicationLevelEnum, CommunicationMethodEnum, EntityTypeEnum } from '@app/models/enums';
import { IAttachedEmail } from '@app/modules/call-center/communication/state/actions';
import { sharedActions } from '@app/modules/shared/state';
import * as fromShared from '@app/modules/shared/state/index';
import * as documentUploadActions from '@app/modules/shared/state/upload-document/actions';
import { Store } from '@ngrx/store';
import * as MsgReader from '@sharpenednoodles/msg.reader-ts';
import moment from 'moment-timezone';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import * as communicationActions from '../modules/call-center/communication/state/actions';

@Injectable({
  providedIn: 'root',
})
export class EmailAttachmentService {
  private ngUnsubscribe$ = new Subject<void>();

  public documentTypes$ = this.store.select(fromShared.sharedSelectors.documentsListSelectors.documentTypes);

  public documentTypes;

  constructor(
    private readonly store: Store,
  ) {
    this.store.dispatch(sharedActions.documentsListActions.GetDocumentTypesByEntityId({ entityTypeId: EntityTypeEnum.Communications }));

    this.documentTypes$
      .pipe(
        first((value: DocumentType[]) => !!value),
      )
      .subscribe((documentTypes: DocumentType[]) => { this.documentTypes = documentTypes; });
  }

  public subscribeToAttachedEmailMethod(
    formGroup: UntypedFormGroup,
    emails: communicationActions.IAttachedEmail[],
    currentCommunicationRecordId: number,
  ): void {
    const files = [];
    let firstEmail: communicationActions.IAttachedEmail = emails[0];

    emails.forEach((email: communicationActions.IAttachedEmail) => {
      if (this.getDateFromEmail(firstEmail) > this.getDateFromEmail(email)) {
        firstEmail = email;
      }
    });

    this.patchCommunicationDetailsEmailValues(firstEmail, formGroup);

    if (firstEmail && firstEmail.outlookData) {
      emails.forEach(({ file, outlookData, attachments }: { file: File, outlookData: any, attachments: any }) => {
        if (outlookData) {
          files.push(file);
          for (let i = 0; i < attachments.length; i++) {
            const currentAttachment = outlookData.attachments[i];
            files.push(new File([attachments[i].content], currentAttachment.fileName, { type: 'application/octet-stream' }));
          }
        }
      });
      this.saveAttachedEmailDocuments(files, currentCommunicationRecordId);
    }
  }

  private saveAttachedEmailDocuments(files: File[], communicationRecordId: number): void {
    const documents = [];
    for (let i = 0; i < files.length; i++) {
      const document = new Document({
        id: !communicationRecordId ? i : 0,
        description: '',
        documentType: i === 0 ? this.documentTypes[2] : this.documentTypes[0],
        documentLinks: [new DocumentLink({
          entityId: communicationRecordId || 0,
          entityType: new EntityType({ id: EntityTypeEnum.Communications }),
        })],
        fileContent: files[i],
        fileNameFull: files[i].name,
      });
      documents.push(document);
    }

    if (communicationRecordId) {
      for (let i = 0; i < documents.length; i++) {
        this.store.dispatch(documentUploadActions.CreateDocument({
          file: files[i],
          document: documents[i],
          onDocumentLoaded: () => this.store.dispatch(sharedActions.documentsListActions.RefreshDocumentsList()),
        }));
      }
    } else {
      this.store.dispatch(sharedActions.documentsListActions.SaveAddedDocuments({ documents }));
      this.store.dispatch(communicationActions.UpdateProjectCommunicationDocumentsCount({ count: documents.length }));
    }
  }

  public async patchEmailValues(email: File, formGroup: UntypedFormGroup): Promise<void> {
    const bytes = await email.arrayBuffer();
    const msgReader = new MsgReader.MSGReader(bytes);
    const parseResult = msgReader.getFileData();
    const data = parseResult as MsgReader.MSGFileData;
    this.parseAndPatchData(data, formGroup);
  }

  public patchCommunicationDetailsEmailValues(firstEmail: IAttachedEmail, formGroup: UntypedFormGroup): void {
    const firstEmailData: MsgReader.MSGFileData = firstEmail.outlookData;
    this.parseAndPatchData(firstEmailData, formGroup);
  }

  private parseAndPatchData(data: MsgReader.MSGFileData, formGroup: UntypedFormGroup): void {
    const recipients = data.recipients.map((recipient: MsgReader.MSGRecipient) => `${recipient.name} / ${recipient.email}`);
    let direction = CommunicationDirectionEnum.Incoming;
    if (data.senderEmail) {
      direction = data.senderEmail.includes('@archersystems.com')
        ? CommunicationDirectionEnum.Outgoing
        : CommunicationDirectionEnum.Incoming;
    }

    const dateFromEmail = this.getDateFromEmailData(data);
    const dateAsMoment = moment(new Date(dateFromEmail));
    const dateIsValid = dateFromEmail && dateAsMoment.isValid();

    formGroup.patchValue({
      direction,
      method: CommunicationMethodEnum.Email,
      emailSubject: data.subject || '',
      emailTo: recipients.join(', '),
      emailFrom: data.senderEmail || '',
      emailBody: data.body.trim(),
      level: CommunicationLevelEnum.Standard,
      startDate: dateIsValid ? new Date(dateFromEmail) : new Date(),
    });
    formGroup.updateValueAndValidity();
  }

  private getDateFromEmailData(emailData: any): string {
    if (!emailData || !emailData.headers) {
      return undefined;
    }
    const { headers } = emailData;

    const headerRegEx = /(.*): (.*)/g;
    const parsedHeaders = {};
    let m;
    // eslint-disable-next-line no-cond-assign
    while (m = headerRegEx.exec(headers)) {
      parsedHeaders[m[1]] = m[2];
    }

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const dateField = parsedHeaders['Date']; // headers.substring(headers.indexOf('Date:'), headers.indexOf('Message-ID:'));
    const dateValue = dateField.substring(dateField.split('').findIndex((date: string) => Number(date))).trim();

    return dateValue;
  }

  public getDateFromEmail(email: communicationActions.IAttachedEmail): string {
    if (!email || !email.outlookData || !email.outlookData.headers) {
      return undefined;
    }
    const { headers } = email.outlookData;

    const headerRegEx = /(.*): (.*)/g;
    const parsedHeaders = {};
    let m;
    // eslint-disable-next-line no-cond-assign
    while (m = headerRegEx.exec(headers)) {
      parsedHeaders[m[1]] = m[2];
    }

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const dateField = parsedHeaders['Date']; // headers.substring(headers.indexOf('Date:'), headers.indexOf('Message-ID:'));
    const dateValue = dateField.substring(dateField.split('').findIndex((date: string) => Number(date))).trim();

    return dateValue;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();

    this.store.dispatch(communicationActions.ClearAttachedEmail());
  }
}
