import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SideMenuPageTrackerService {
  private pageName = new Subject<string>();

  pageName$ = this.pageName.asObservable();

  pageChange(pageName: string) {
    this.pageName.next(pageName);
  }
}
