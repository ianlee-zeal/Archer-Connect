import { Auditable } from '@app/models/auditable';
import { OutputContainerType } from '@app/models/enums/document-generation/output-container-type';
import { OutputFileType } from '@app/models/enums/document-generation/output-file-type';
import { OutputType } from '@app/models/enums/document-generation/output-type';
import { IdValue } from '@app/models/idValue';
import { User } from '@app/models/user';
import { Document } from '../document';

export class DocumentTemplate extends Auditable {
  id: number;
  name: string;
  outputType: OutputType;
  outputFileType: OutputFileType;
  outputContainerType: OutputContainerType;
  outputFileNamingConvention: string;
  watermark: string;
  document?: Document;

  outputTypeSupported?: boolean;
  outputFileTypeSupported?: boolean;
  outputFileNameSupported?: boolean;
  watermarkSupported?: boolean;
  outputFileNamingConventionSupported?: boolean;
  outputFileTypes: string[];
  documentTypeId: number;
  projects: IdValue[];
  isGlobal: boolean;
  projectName: string;
  documentImportTemplateId?: number;

  relatedDocumentTemplateId?: number;
  envelopeHeader?: string;
  emailSubjectLine?: string;
  emailIntro?: string;
  emailBody?: string;
  emailFooter?: string;
  ccSignedDocuments?: string[];
  testRecipients?: string[];
  lastTestedBy: User;
  lastTestedDate: Date;
  electronicDeliveryProviderId?: number;

  constructor(model?: Partial<DocumentTemplate>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): DocumentTemplate {
    var recipients: string[] = null;
    var ccSignedDocuments: string[] = null;

    if (item.testRecipients != null) {
      const recipientsArray: string[] = item.testRecipients.split(',').map(recipient => recipient.trim());
      recipients = recipientsArray;
    }

    if (item.ccSignedDocuments != null) {
      const ccSignedDocumentsArray: string[] = item.ccSignedDocuments.split(',').map(cc => cc.trim());
      ccSignedDocuments = ccSignedDocumentsArray;
    }

    return {
      ...super.toModel(item),
      id: item.id,
      name: item.name,
      outputType: item.outputType,
      outputFileType: item.outputFileType,
      outputContainerType: item.outputContainerType,
      outputFileNamingConvention: item.outputFileNamingConvention,
      watermark: item.watermark,

      document: item.document ? Document.toModel(item.document) : null,

      outputTypeSupported: item.OutputTypeSupported,
      outputFileTypeSupported: item.OutputFileTypeSupported,
      outputFileNameSupported: item.OutputFileNameSupported,
      watermarkSupported: item.WatermarkSupported,
      outputFileNamingConventionSupported: item.OutputFileNamingConventionSupported,
      outputFileTypes: item.OutputFileTypes?.split(','),
      documentTypeId: item.documentTypeId,
      projects: item.projects,
      isGlobal: item.isGlobal,
      projectName: item.projectName,
      documentImportTemplateId: item.documentImportTemplateId,

      relatedDocumentTemplateId: item.relatedDocumentTemplateId,
      envelopeHeader: item.envelopeHeader,
      emailSubjectLine: item.emailSubjectLine,
      emailIntro: item.emailIntro,
      emailBody: item.emailBody,
      emailFooter: item.emailFooter,
      ccSignedDocuments: ccSignedDocuments,
      testRecipients: recipients,
      lastTestedBy: item.lastTestedBy,
      lastTestedDate: item.lastTestedDate,
      electronicDeliveryProviderId: item.electronicDeliveryProviderId,
    };
  }
}
