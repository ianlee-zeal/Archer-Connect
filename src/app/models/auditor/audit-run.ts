import { Document } from '@app/models/documents';
import { Status } from '@app/models/status';
import { User } from '@app/models';
import { AuditDocImportTemplate } from './audit-doc-import-template';
import { AuditResultCounts } from './audit-result-counts';

export class AuditRun {
  id: number;
  auditDocImportTemplateId: number;
  runStatusId: number;
  isPreview: boolean;
  rowsCount?: number;
  liensCount?: number;
  approvedCount?: number;
  deniedCount?: number;
  ignoredCount?: number;
  successCount?: number;
  warningsCount?: number;
  errorsCount?: number;
  createdById: number;
  createdDate: Date;
  runSettings: string;
  batchNumber: number;
  statusMessage: string;
  inputDocument: Document;
  resultDocument: Document;
  previewDocument: Document;
  existedFileId: number;

  runStatus: Status;
  createdBy: User;
  auditDocImportTemplate: AuditDocImportTemplate;
  counts?: AuditResultCounts;

  static toModel(item: AuditRun | any) : AuditRun | null {
    if (item) {
      return {
        ...item,
        createdDate: item.createdDate ? new Date(item.createdDate) : null,
        runStatus: item.runStatus ? Status.toModel(item.runStatus) : null,
        createdBy: item.createdBy ? User.toModel(item.createdBy) : null,
        inputDocument: item.inputDocument ? Document.toModel(item.inputDocument) : null,
        resultDocument: item.resultDocument ? Document.toModel(item.resultDocument) : null,
        previewDocument: item.previewDocument ? Document.toModel(item.previewDocument) : null,
        auditDocImportTemplate: AuditDocImportTemplate.toModel(item.auditDocImportTemplate),
      };
    }

    return null;
  }
}
