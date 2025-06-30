import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingIndicatorService {
  private delay = 300;
  private isLoading = new Subject<boolean>();
  private timeoutId: number;

  public stateChanged = new EventEmitter<boolean>();

  constructor() {
    this.isLoading.subscribe(isLoading => {
      if (isLoading) {
        if (!this.timeoutId) {
          this.timeoutId = window.setTimeout(() => {
            this.stateChanged.emit(isLoading);
          }, this.delay);
        }
      }
      else {
        window.clearTimeout(this.timeoutId);
        this.timeoutId = null;
        this.stateChanged.emit(isLoading);
      }
    });
  }

  public show() {
    this.isLoading.next(true);
  }

  public hide() {
    this.isLoading.next(false);
  }
}
