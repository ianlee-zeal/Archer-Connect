import { Component, OnInit, } from '@angular/core'; import { Store } from '@ngrx/store';

import * as fromDashbaord from '../state';

@Component({
  selector: 'app-dashboard-index',
  templateUrl: './dashboard-index.component.html',
  styleUrls: ['./dashboard-index.component.scss'],
})
export class DashboardIndexComponent implements OnInit {
  public pending$ = this.store.select(fromDashbaord.pending);

  constructor(
    private store: Store<fromDashbaord.AppState>,
  ) { }

  ngOnInit() {
  }
}
