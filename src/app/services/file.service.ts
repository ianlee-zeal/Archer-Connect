import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonHelper } from '@app/helpers';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  /**
  @deprecated OBSOLETE. PRODUCES UNEXPECTED ISSUES IN CHROME.
  If you want to send a file, please use 'form' functionality to do that.
  See CommunicationService.uploadFiles() for reference
  */
  static fileToByteArray(file: File): Observable<any> {
    CommonHelper.windowLog(`static fileToByteArray(file: File)`, file);

    return new Observable(observable => {
      CommonHelper.windowLog(`Read the file. START`, file);

      const filereader = new FileReader();

      filereader.onload = () => {
        CommonHelper.windowLog(`filereader.onload`);
        const buffer = filereader.result;
        CommonHelper.windowLog(`buffer`, buffer);
        const view = new Uint8Array(buffer as ArrayBuffer);
        CommonHelper.windowLog(`view`, view);

        CommonHelper.windowLog(`BEFORE observable.next(view)`, observable);
        observable.next(view);
      };

      CommonHelper.windowLog(`filereader.onloadend = () => observable.complete();`);
      filereader.onloadend = () => observable.complete();

      CommonHelper.windowLog(`filereader.readAsArrayBuffer(file);`);
      filereader.readAsArrayBuffer(file);

      CommonHelper.windowLog(`Read the file. COMPLETED`, file);
    });
  }

  /**
  @deprecated OBSOLETE. PRODUCES UNEXPECTED ISSUES IN CHROME.
  If you want to send a file, please use 'form' functionality to do that.
  See CommunicationService.uploadFiles() for reference
  */
  static fileToByteArray2(file: File): Promise<any> {
    CommonHelper.windowLog(`static fileToByteArray2(file: File)`, file);

    return new Promise((resolve, reject) => {
      try {
        CommonHelper.windowLog(`Read the file. START`, file);
        let reader = new FileReader();
        let fileBytes = [];

        CommonHelper.windowLog('BEFORE reader.readAsArrayBuffer(file)');
        reader.readAsArrayBuffer(file);
        CommonHelper.windowLog('AFTER reader.readAsArrayBuffer(file)');

        reader.onloadend = evt => {
          CommonHelper.windowLog('reader.onloadend = (evt) =>', evt);
          CommonHelper.windowLog('evt?.target?.readyState', evt?.target?.readyState);

          if (evt?.target?.readyState == FileReader.DONE) {
            CommonHelper.windowLog('evt?.target?.readyState == FileReader.DONE');

            let arrayBuffer = evt.target.result;
            CommonHelper.windowLog('arrayBuffer', arrayBuffer);

            let bytes = new Uint8Array(arrayBuffer as ArrayBuffer);
            CommonHelper.windowLog('bytes', bytes);

            for (let byte of bytes) {
              fileBytes.push(byte);
            }
          }

          if (reader.error) {
            CommonHelper.windowLog('if (reader.error) err', file, reader.error);
            CommonHelper.windowLog('if (reader.error) reader', file, reader);
          }

          CommonHelper.windowLog('resolve(fileBytes)', fileBytes);
          resolve(fileBytes);
        }

        reader.onerror = () => {
          CommonHelper.windowLog('reader.onerror', file, reader.error);
          reader.abort();
          reject(new Error(`Cannot parse input file: ${file.name}`));
        };
      }
      catch (e) {
        CommonHelper.windowLog('reject(e)', e);
        reject(e);
      }
    })
  }
}
