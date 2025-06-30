import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ClaimantDetailsState } from '../state/reducer';
import * as selectors from '../state/selectors';

@Component({
  selector: 'app-injury-events-tab',
  templateUrl: './injury-events-tab.component.html',
  styleUrls: ['./injury-events-tab.component.scss'],
})
export class InjuryEventsTabComponent {
  constructor(private store: Store<ClaimantDetailsState>) { }
  public claimant$ = this.store.select(selectors.item);
}
