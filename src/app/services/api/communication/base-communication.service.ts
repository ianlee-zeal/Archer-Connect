import { Injectable } from '@angular/core';

import { FileHelper } from '@app/helpers/file.helper';
import { Document } from '@app/models/documents/document';
import { ProjectCommunicationRecord } from '@app/models/communication-center/project-communication-record';
import { CommunicationRecord } from '@app/models/communication-center';
import { RestService } from '../_rest.service';

@Injectable({ providedIn: 'root' })
export class BaseCommunicationService extends RestService<any> {
  endpoint: string;

  uploadFiles(communicationRecord: CommunicationRecord | ProjectCommunicationRecord) {
    const data = { ...communicationRecord, relatedDocuments: [...communicationRecord.relatedDocuments] };
    const formData = new FormData();

    for (let i = 0; i < data.relatedDocuments.length; i++) {
      const doc = data.relatedDocuments[i];

      const extension = FileHelper.getExtensionExtended(doc.fileNameFull);
      doc.fileName = FileHelper.extractFileNameExtended(doc.fileNameFull, extension);
      doc.mimeType = { extension } as any;

      formData.append('file', doc.fileContent, doc.fileName);
      data.relatedDocuments[i] = (Document.toDto(data.relatedDocuments[i], true)) as any;
    }

    formData.append('createData', JSON.stringify(data));

    return this.api.postFormData(this.endpoint, formData);
  }
}
