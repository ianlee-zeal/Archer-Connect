import { FileContent } from "./file-content";
import { ElectronicDeliveryProvider } from '@app/models/enums/ledger-settings/electronicDeliveryProvider';

export class TestCSGenerationRequest {
    ditId?: number;
    envelopeHeader?: string;
    subjectLine?: string;
    intro?: string;
    body?: string;
    footer?: string;
    recipients?: string[];
    ccSignedDocuments?: string[];
    formFile?: FileContent;
    fromUploadOrUpdate?: boolean;
    csTemplateName?: string;
    electronicDeliveryProviderId?: ElectronicDeliveryProvider;

    constructor(
      envelopeHeader?: string,
      subjectLine?: string,
      intro?: string,
      body?: string,
      footer?: string,
      recipients?: string[],
      ccSignedDocuments?: string[],
      fromUploadOrUpdate?: boolean,
      csTemplateName?: string,
      electronicDeliveryProviderId?: ElectronicDeliveryProvider
      ) {
        this.envelopeHeader = envelopeHeader;
        this.subjectLine = subjectLine;
        this.intro = intro;
        this.body = body;
        this.footer = footer;
        this.recipients = recipients;
        this.ccSignedDocuments = ccSignedDocuments;
        this.formFile = null;
        this.fromUploadOrUpdate = fromUploadOrUpdate;
        this.csTemplateName = csTemplateName;
        this.electronicDeliveryProviderId = electronicDeliveryProviderId;
      }
  }
