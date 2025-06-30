import { PipeTransform, Pipe } from '@angular/core';
import { LienServiceStatus } from '@app/models/enums';

@Pipe({ name: 'lienStatusPipe' })
export class LienStatusPipe implements PipeTransform {
  transform(status: LienServiceStatus): string {
    switch (status) {
      case LienServiceStatus.NotEngaged: return 'Not Engaged';

      default: return LienServiceStatus[status];
    }
  }
}
