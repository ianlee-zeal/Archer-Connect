import { Injectable } from '@angular/core';
import * as MsgReader from '@sharpenednoodles/msg.reader-ts';
import { FileHelper } from '@app/helpers/file.helper';
import Dropzone from 'dropzone';
import { LogService } from './log-service';

/**
 * Service for working with drag and drop functionality
 *
 * @export
 * @class DragAndDropService
 */
@Injectable({ providedIn: 'root' })
export class DragAndDropService {
  /**
   * Creates an instance of DragAndDropService.
   * @param {LogService} loggerService
   * @memberof DragAndDropService
   */
  constructor(private readonly loggerService: LogService) {}

  /**
   * Subscribes to drag and drop events
   *
   * @param {string} dragAndDropTargetSelector - drag and drop target selector
   * @param {(error: string) => void} onErrorCallback - error handler
   * @param {(
   *       file: File,
   *       data: MsgReader.MSGFileData,
   *       attachments: MSGAttachmentData[],
   *     ) => void} onSuccessCallback - success handler
   * @memberof DragAndDropService
   */
  subscribeToDragAndDropEvents(
    dragAndDropTargetSelector: string,
    onErrorCallback: (error: string) => void,
    onSuccessCallback: (
      file: File,
      data: MsgReader.MSGFileData,
      attachments: MsgReader.MSGAttachmentData[],
    ) => void,
  ) {
    try {
      const dropzone = new Dropzone(dragAndDropTargetSelector, {
        url: './fake', // fake, must be indicated for the plugin but we do not use it
        autoProcessQueue: false,
        clickable: false,
      });

      dropzone.on('addedfile', async file => {
        const fileExtension = FileHelper.getExtension(file.name);
        if (fileExtension !== 'msg') {
          onSuccessCallback(file, null, []);
          return;
        }
        const bytes = await file.arrayBuffer();
        const msgReader = new MsgReader.MSGReader(bytes);
        const parseResult = msgReader.getFileData();

        const error = (parseResult as MsgReader.MSGErrorResult).error;
        if (error) {
          onErrorCallback(error);
          return;
        }

        const outlookData = parseResult as MsgReader.MSGFileData;
        const attachments = new Array<MsgReader.MSGAttachmentData>();
        for (let i = 0; i < outlookData.attachments.length; i++) {
          attachments.push(msgReader.getAttachment(i));
        }

        onSuccessCallback(file, outlookData, attachments);
      });
    } catch (ex) {
      this.loggerService.log('DragAndDropService', ex);
    }
  }
}
