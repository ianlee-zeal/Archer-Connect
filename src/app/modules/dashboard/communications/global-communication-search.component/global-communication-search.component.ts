import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromDashboard from '../../state';
import { selectors } from '../state';

@Component({
  selector: 'app-global-communication-search',
  templateUrl: './global-communication-search.component.html',
  styleUrls: ['./global-communication-search.component.scss'],
})
export class GlobalCommunicationSearch {
  public readonly actionBar$ = this.store.select(selectors.actionBar);

  public readonly gridId: GridId = GridId.GlobalCommunicationSearch;

  constructor(
    private store: Store<fromDashboard.AppState>,
  ) { }
}
