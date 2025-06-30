import { PipeTransform, Pipe } from '@angular/core';
import { LienServiceStatus } from '@app/models/enums';

@Pipe({ name: 'lienStatusIconPipe' })
export class LienStatusIconPipe implements PipeTransform {
  transform(status: LienServiceStatus): string {
    switch (status) {
      case LienServiceStatus.Finalized: return 'assets/svg/status-finalized.svg';
      case LienServiceStatus.NotEngaged: return ' ';

      default: return 'assets/svg/status-pending.svg';
    }
  }
}
