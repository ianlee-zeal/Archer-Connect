import { Attachment } from '@app/models/attachment';
import { DocumentLink } from '@app/models/documents';
import { EntityType } from '@app/models/entity-type';
import { Document } from '../models/documents/document';

export class FileHelper {
  public static readonly maxFileNameLength:number = 200;
  public static getExtension(fileName: string): string {
    return fileName.split('.').pop();
  }

  public static getExtensionExtended(fileName: string): string {
    let fileNameTemp = fileName;
    if (fileNameTemp.indexOf('.') === -1) {
      fileNameTemp += '.';
    }
    return fileNameTemp.split('.').pop();
  }

  public static extractFileName(fileName: string, extension: string): string {
    return fileName.substring(0, fileName.indexOf(extension) - 1);
  }

  public static extractFileNameExtended(fileName: string, extension: string): string {
    if (!extension) {
      return fileName;
    }
    return fileName.substring(0, fileName.indexOf(extension) - 1);
  }

  public static truncateFileName(fileName: string, length: number): string {
    if (fileName.length <= length) {
      return fileName;
    }
    return fileName.substring(0, length);
  }

  public static convertToDocument(file: File, entityId: number, documentTypeId: number, entityTypeId: number): Document {
    const fileName = file.name;
    const extension = FileHelper.getExtension(fileName);
    const document = new Document();

    document.name = FileHelper.extractFileName(fileName, extension);
    document.fileName = file.name;
    document.fileNameFull = fileName;
    document.fileContent = file;
    document.documentTypeId = documentTypeId;
    document.createdDate = new Date();
    document.documentLinks = [new DocumentLink({
      entityId,
      entityType: new EntityType({ id: entityTypeId }),
    })];

    return document;
  }

  public static convertToAttachment(file: File): Attachment {
    const fileName = file.name;
    const extension = FileHelper.getExtension(fileName);
    const attachment = new Attachment();

    attachment.name = FileHelper.extractFileName(fileName, extension);
    attachment.fileName = fileName;
    attachment.fileExtension = extension;
    attachment.fileContent = file;

    return attachment;
  }

  public static bytesToMegabytes(bytes: number): number {
    const megabytes = bytes / (1024 * 1024);
    return megabytes;
  }

  public static base64ToFile(base64: string, fileName: string, contentType: string): File {
    const byteString = atob(base64);
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }
    return new File([byteArray], fileName, { type: contentType });
  }
}
