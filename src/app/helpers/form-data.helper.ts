import { Document } from '@app/models/documents/document';
import { FileHelper } from './file.helper';

export class FormDataHelper {
  public static objectToFormData(obj, form = null, namespace = '') {
    const formData = form || new FormData();
    let key;

    for (const property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (namespace) {
          key = `${namespace}[${property}]`;
        } else {
          key = property;
        }

        if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
          this.objectToFormData(obj[property], formData, `${namespace}[${property}]`);
        } else {
          formData.append(key, obj[property]);
        }
      }
    }

    return formData;
  }

  public static documentsToFormData(documents: Document[], formData: FormData = new FormData()) {
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];

      const extension = FileHelper.getExtension(doc.fileNameFull);
      doc.fileName = FileHelper.extractFileName(doc.fileNameFull, extension);
      doc.mimeType = { extension } as any;

      formData.append('file', doc.fileContent, doc.fileName);
    }
    return formData;
  }
}
