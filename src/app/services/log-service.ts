import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class LogService {
  log(value: any, ...rest: any[]): void {
    if (environment.showLogs) {
      // eslint-disable-next-line no-console
      console.log(value, rest);
    }
  }
}
