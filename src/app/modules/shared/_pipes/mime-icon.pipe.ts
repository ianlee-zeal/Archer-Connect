import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'mimeIcon' })
export class MimeIconPipe implements PipeTransform {
  transform(extension: string) {
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return String.fromCharCode(0xf1c3);
        break;

      case 'csv':
        return String.fromCharCode(0xf6dd);
        break;

      case 'docx':
      case 'doc ':
        return String.fromCharCode(0xf1c2);
        break;

      case 'pptx':
      case 'ppt':
        return String.fromCharCode(0xf1c4);
        break;

      case 'pdf':
        return String.fromCharCode(0xf1c1);
        break;

      default: break;
    }
  }
}
