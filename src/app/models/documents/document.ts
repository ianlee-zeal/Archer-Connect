/* eslint-disable import/no-cycle */
import { DocumentType as DocumentTypeEnum } from '@app/models/enums';
import { DocumentType } from './document-type';
import { Status } from '../status';
import { Channel } from '../channel';
import { MimeType } from '../mime-type';
import { DocumentLink } from './document-link';
import { Auditable } from '../auditable';
import { DocumentDataSourceEnum } from '../enums/document-data-source';
import { ClosingStatement } from '../closing-statement/closing-statement';
import { IdValue } from '../idValue';

export class Document extends Auditable {
  id: number;
  description: string;
  documentType: DocumentType;
  documentTypeId: number;
  trackingIdentifier: number;
  otherDocumentType: string;
  status: Status;
  channel: Channel;
  size: number;
  pagesCount: number;
  fileName: string;
  fileContent: File;
  mimeType: MimeType;
  documentLinks: DocumentLink[];
  fileNameFull: string;
  name: string;
  dataSourceId: string;
  primaryFirmName: string;
  closingStatement: ClosingStatement;
  filePath: string;
  organizationAccesses: IdValue[] | null;

  constructor(model?: Partial<Document>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): Document | null {
    if (item) {
      const fileExtension = item.mimeType ? `.${item.mimeType.extension}` : '';
      return {
        ...super.toModel(item),
        id: item.id,
        trackingIdentifier: item.documentTypeId === DocumentTypeEnum.ClosingStatement ? item.trackingIdentifier : null,
        description: item.description || null,
        documentType: DocumentType.toModel(item.documentType),
        documentTypeId: item.documentTypeId,
        otherDocumentType: item.otherDocumentType,
        status: Status.toModel(item.status),
        channel: Channel.toModel(item.channel),
        size: item.size || 0,
        pagesCount: item.pagesCount || 0,
        fileName: item.fileName,
        fileContent: item.fileContent,
        mimeType: MimeType.toModel(item.mimeType),
        documentLinks: item.documentLinks,
        fileNameFull: !item.fileName?.endsWith(fileExtension) ? `${item.fileName}${fileExtension}` : item.fileName,
        name: item.name,
        dataSourceId: DocumentDataSourceEnum[item.dataSourceId],
        primaryFirmName: item.primaryFirmName,
        closingStatement: ClosingStatement.toModel(item.closingStatement),
        filePath: item.filePath,
        organizationAccesses: item.organizationAccesses,
      };
    }

    return null;
  }

  public static toDto(item: Document, skipContents = false) {
    const docId = DocumentDataSourceEnum[item.dataSourceId];
    return {
      id: item.id,
      description: item.description,
      documentType: item.documentType,
      otherDocumentType: item.otherDocumentType,
      status: item.status,
      channel: item.channel,
      size: item.size,
      pagesCount: item.pagesCount,
      fileName: item.fileName,
      fileContent: skipContents ? null : item.fileContent,
      mimeType: item.mimeType,
      documentLinks: item.documentLinks,
      dataSourceId: docId,
      name: item.name,
      organizationAccesses: item.organizationAccesses,
    };
  }
}
