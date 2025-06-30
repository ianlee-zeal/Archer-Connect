import { Injectable, EventEmitter } from '@angular/core';
import { BaseNavService } from './base-nav.service';

@Injectable({ providedIn: 'root' })
export class SideNavBarService extends BaseNavService {
  public toggleChanged = new EventEmitter<boolean>();
  public opened = false;

  public toggle() {
    this.opened = !this.opened;
    this.toggleChanged.emit(this.opened);
  }
}
