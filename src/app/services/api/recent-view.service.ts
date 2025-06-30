import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';
import { RecentView } from '@app/models';
import { Page } from '@app/models/page';

@Injectable({
  providedIn: 'root'
})
export class RecentViewService extends RestService<RecentView> {
  endpoint = '/page-view-events';

  public getList(count: number): Observable<Page<RecentView>> {
    return this.index({ count });
  }

  public create(recentView: RecentView): Observable<void> {
    return this.api.post(this.endpoint, RecentView.toDto(recentView));
  }
}
