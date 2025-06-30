import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromDashboard from '../../state';
import { selectors } from '../state';

@Component({
  selector: 'app-matters',
  templateUrl: './matters.component.html',
  styleUrls: ['./matters.component.scss'],
})
export class MattersComponent {
  public readonly actionBar$ = this.store.select(selectors.actionBar);

  public readonly gridId: GridId = GridId.Matters;

  constructor(
    private store: Store<fromDashboard.AppState>,
  ) { }
}
