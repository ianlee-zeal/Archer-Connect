import { Injectable } from '@angular/core';
import { FileHelper } from '@app/helpers/file.helper';
import { Observable } from 'rxjs';

export interface FileValidationResult {
  error: string;
  validFiles: File[];
}

@Injectable({ providedIn: 'root' })
export class FileValidatorService {
  public validateFileType(files: File[], allowedExtensions: string[]): Observable<FileValidationResult> {
    return new Observable(observable => {
      const invalidFiles: string[] = [];
      const validFiles: File[] = [];

      files.forEach(file => {
        if (file === null) {
          return;
        }
        const fileName = file.name;
        const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
        const hasFileAllowedExtension = !!allowedExtensions.find(extension => extension.includes(fileExtension));

        if (!hasFileAllowedExtension) {
          invalidFiles.push(fileName);
        } else {
          validFiles.push(file);
        }
      });

      observable.next({
        error: this.getError(files, invalidFiles),
        validFiles,
      });
    });
  }

  public validateFileSize(files: File[], maxSize: number): Observable<FileValidationResult> {
    return new Observable(observable => {
      const invalidFiles: string[] = [];
      const validFiles: File[] = [];

      files.forEach(file => {
        if (file.size > maxSize) {
          invalidFiles.push(file.name);
        } else {
          validFiles.push(file);
        }
      });

      observable.next({
        error: this.getSizeError(invalidFiles, maxSize),
        validFiles,
      });
    });
  }

  private getError(allFiles: File[], invalidFiles: string[]): string {
    let error: string = null;

    if (invalidFiles.length) {
      error = allFiles.length === 1 ? `File ${invalidFiles[0]} is not the proper format` : `Files are not the proper format: ${invalidFiles.join(',')}`;
    }

    return error;
  }

  private getSizeError(invalidFiles: string[], maxSize: number): string {
    let error: string = null;

    if (invalidFiles.length) {
      error = `File exceeds ${FileHelper.bytesToMegabytes(maxSize)} MB`;
    }

    return error;
  }


}
