export class CreateOrUpdateTemplateRequest {
  id?: number;
  documentId?: number;
  name: string;
  documentTypeId: number;
  documentStatusId: number;
  fileName: string;
  fileExtension: string;
  fileContent: number[];
  file: File;
  projects: string;
  projectIds: number[];
  isGlobal: boolean;
  relatedDocumentTemplateId?: number;
  electronicDeliveryProviderId?: number;
  envelopeHeader?: string;
  emailSubjectLine?: string;
  emailIntro?: string;
  emailBody?: string;
  emailFooter?: string;
  ccSignedDocuments?: string[];
  recipients?: string[];
  lastTestedBy: string;
  lastTestedDate: Date;
}
