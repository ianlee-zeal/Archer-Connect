import { Auditable } from '../auditable';
import { Job } from './job';
import { Document } from './document';
import { MimeType } from '../mime-type';
import { DocumentType as DocumentTypeEnum } from '@app/models/enums';

export class DocumentImport extends Auditable {
  id?: number;
  entityTypeId: number;
  entityId: number;
  jobId: number;
  templateId: number;
  templateName: string;
  orgId: number;
  channelName: string;

  countTotal: number;
  countInserted: number;
  countUpdated: number;
  countNotUpdated: number;
  countDeleted: number;
  countErrored: number;
  countWarned: number;
  countLoaded: number;

  documentTypeId: DocumentTypeEnum;

  fileName: string;
  fileContent: File;
  mimeType: MimeType;

  importDoc: Document;
  previewDoc: Document;
  resultsDoc: Document;
  loadingResultsDoc: Document;
  previewImportDoc: Document;
  reviewDoc: Document;
  postActionAuditReportDoc: Document;
  job: Job;
  existedFileId: number;

  lastModifiedById: number | undefined;

  config: any;

  constructor(model?: Partial<DocumentImport>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): DocumentImport {
    if (!item) return null;

    return {
      ...super.toModel(item),
      id: item.id,
      entityId: item.entityId,
      entityTypeId: item.entityTypeId,
      orgId: item.orgId,
      jobId: item.jobId,
      countTotal: item.countTotal,
      countInserted: item.countInserted,
      countUpdated: item.countUpdated,
      countNotUpdated: item.countNotUpdated,
      countDeleted: item.countDeleted,
      countErrored: item.countErrored,
      countWarned: item.countWarned,
      countLoaded: item.countLoaded,
      documentTypeId: item.documentTypeId,
      fileName: item.fileName,
      fileContent: item.fileContent,
      mimeType: MimeType.toModel(item.mimeType),
      lastModifiedById: item.lastModifiedById,
      templateId: item.templateId,
      templateName: item.templateName,
      channelName: item.channelName,
      importDoc: Document.toModel(item.importDoc),
      previewDoc: Document.toModel(item.previewDoc),
      reviewDoc: Document.toModel(item.reviewDoc),
      resultsDoc: Document.toModel(item.resultsDoc),
      loadingResultsDoc: Document.toModel(item.loadingResultsDoc),
      config: item.config ? JSON.parse(item.config) : null,
      job: Job.toModel(item.job),
      previewImportDoc: Document.toModel(item.previewImportDoc),
      postActionAuditReportDoc: Document.toModel(item.postActionAuditReportDoc),
      existedFileId: item.existedFileId,
    };
  }

  public static toDto(item: DocumentImport): any {
    return {
      ...item,
      config: JSON.stringify(item.config),
    };
  }
}
