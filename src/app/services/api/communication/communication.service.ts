import { Injectable } from '@angular/core';

import { FileHelper } from '@app/helpers/file.helper';
import { Observable } from 'rxjs';
import { CommunicationRecord } from '@app/models/communication-center/communication-record';
import { CommonHelper } from '@app/helpers';
import { ColumnExport } from '@app/models';
import { ProjectCommunicationRecord } from '@app/models/communication-center/project-communication-record';
import { FileService } from '../../file.service';
import { BaseCommunicationService } from './base-communication.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class CommunicationService extends BaseCommunicationService {
  endpoint = '/communications';

  public createCommunicationRecord(communicationRecord: CommunicationRecord | ProjectCommunicationRecord): Observable<any> {
    // TODO: remove old logic if new upload works
    // CommonHelper.windowLog('createCommunicationRecord', communicationRecord);
    // const result = from(this.postCommunication(communicationRecord));
    // CommonHelper.windowLog('result', result);
    return this.uploadFiles(communicationRecord);
  }

  private async postCommunication(communicationRecord): Promise<any> {
    CommonHelper.windowLog('postCommunication');
    CommonHelper.windowLog('communicationRecord.relatedDocuments', communicationRecord.relatedDocuments);

    if (communicationRecord.relatedDocuments) {
      for (const doc of communicationRecord.relatedDocuments) {
        CommonHelper.windowLog('file', doc.fileContent);
        const file = doc.fileContent;

        const extension = FileHelper.getExtension(file.name);
        CommonHelper.windowLog('extension', extension);

        doc.fileName = FileHelper.extractFileName(file.name, extension);
        CommonHelper.windowLog('doc.fileName', doc.fileName);

        CommonHelper.windowLog('await this.toByteArray(file)');
        // eslint-disable-next-line no-await-in-loop
        doc.fileContent = await this.toByteArray(file);

        CommonHelper.windowLog('doc.fileContent', doc.fileContent);
        doc.mimeType = { extension };
      }
    }

    CommonHelper.windowLog('this.api.post(this.endpoint, communicationRecord)', this.endpoint, communicationRecord);
    return this.api.post(this.endpoint, communicationRecord).toPromise();
  }

  private async toByteArray(file: File) {
    CommonHelper.windowLog('toByteArray2 START', file);
    const data = await FileService.fileToByteArray2(file);
    CommonHelper.windowLog('toByteArray2 COMPLETED', data);

    if (data == null) {
      throw new Error(`Cannot read the file ${file.name}`);
    }

    CommonHelper.windowLog('BEFORE return Array.from(data);');
    return Array.from(data);
  }

  public export(name: string, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[], channelName: string): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    return this.api.post(`${this.endpoint}/export`, requestParams);
  }

  public downloadDocument(id: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/${id}/export`);
  }
}
