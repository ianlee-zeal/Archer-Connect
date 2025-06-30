import { PipeTransform, Pipe } from '@angular/core';
import { PrependPipe } from './prepend.pipe';

@Pipe({ name: 'pin' })
export class PinPipe implements PipeTransform {
  constructor(private prependPipe: PrependPipe) { }

  transform(pin: string, showFull?: boolean): string {
    if (showFull) {
      return pin;
    }

    return this.prependPipe.transform((pin?.replace(/./g, '*') || ''), '******', 1);
  }
}
