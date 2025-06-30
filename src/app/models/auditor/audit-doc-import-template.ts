import { Org, User } from '@app/models';
import { Document } from '@app/models/documents';
import { DocumentImportTemplate } from '@app/models/documents';

export class AuditDocImportTemplate {
  id: number;
  name: string;
  documentImportTemplateId?: number;
  templateDocumentId?: number;
  collectorId: number;
  collectorOrgId?: number;
  templateName: string;
  templateDescription: string;
  isDefault: boolean;
  diagnosisCodeColumnNames: string;
  drugCodeColumnNames: string;
  serviceDateColumnNames: string;
  cptCodeColumnNames: string;
  auditedAmountColumnName: string;
  treatmentDateColumnNames: string;
  treatmentCodeColumnNames: string;
  lienProductIdColumnName: string;
  duplicateDetectionColumnNames: string;
  isActive: boolean;
  createdById: number;
  LastModifiedById?: number;
 createdDate: Date;
  lastModifiedDate?: Date;
  documentImportTemplate: DocumentImportTemplate;
  collector: Org;
  createdBy: User;
  lastModifiedBy: User;
  collectorOrg: Org;
  templateDocument: Document;

  constructor(model?: AuditDocImportTemplate) {
    Object.assign(this, model);
  }

  static toModel(item: any) : AuditDocImportTemplate | null {
    if (item) {
      return {
        ...item,
        name: item.templateName,
        createdDate: new Date(item.createdDate),
        lastModifiedDate: item.lastModifiedDate ? new Date(item.lastModifiedDate) : null,
        documentImportTemplate: DocumentImportTemplate.toModel(item.documentImportTemplate),
        collector: item.collector ? Org.toModel(item.collector) : null,
        createdBy: User.toModel(item.createdBy),
        lastModifiedBy: User.toModel(item.lastModifiedBy),
        collectorOrg: item.collectorOrg ? Org.toModel(item.collectorOrg) : null,
        templateDocument: Document.toModel(item.templateDocument)
      };
    }

    return null;
  }
}
