import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'absolutenumber' })
export class AbsoluteNumberPipe implements PipeTransform {
  constructor() { }

  transform(num: number): number {
    return Math.abs(num);
  }
}
