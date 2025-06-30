import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
  private units = [
    'bytes',
    'KB',
    'MB',
    'GB',
  ];

  public transform(size: number = 0, precision: number = 2): string {
    if (isNaN(parseFloat(String(size))) || !isFinite(size)) {
      return '?';
    }

    let unit = 0;

    while (size >= 1024) {
      size /= 1024;
      unit++;
    }

    return `${size.toFixed(+precision)} ${this.units[unit]}`;
  }
}
