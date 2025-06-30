import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'prepend' })
export class PrependPipe implements PipeTransform {
  transform(initialStr: string, valueToPrepend: string, repeatCounter: number): string {
    if (!initialStr || !valueToPrepend || !repeatCounter) {
        return initialStr;
    }

    const repeated = valueToPrepend.repeat(repeatCounter);

    return repeated + initialStr;
  }
}
