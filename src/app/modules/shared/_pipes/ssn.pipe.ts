import { PipeTransform, Pipe } from '@angular/core';
import { ValidationService } from '@app/services/validation.service';
import { PrependPipe } from './prepend.pipe';

@Pipe({ name: 'ssn' })
export class SsnPipe implements PipeTransform {
  constructor(private prependPipe: PrependPipe) { }

  transform(ssn: string, showFull?: boolean): string {
    if (showFull) {
      if (ssn && ssn.length < 9) {
        return ssn;
      }

      let matches = ssn.match(ValidationService.ssnPattern);

      if (!matches) {
        matches = ssn.match(ValidationService.ssnFormattedPattern);

        return matches ? matches[0] : '';
      }

      return matches.slice(1).join('-');
    }

    return this.prependPipe.transform((ssn || '').substr(-4), '***-**-', 1);
  }
}
