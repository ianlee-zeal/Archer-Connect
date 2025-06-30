import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as claimantSelectors from '../../state/selectors';

@Component({
  selector: 'app-claimant-disbursements',
  templateUrl: './claimant-disbursements.component.html',
  styleUrls: ['./claimant-disbursements.component.scss'],
})
export class ClaimantDisbursementsComponent implements OnInit {
  public readonly currentClaimant$ = this.store.select(claimantSelectors.item);

  constructor(
    private readonly store: Store<any>,
  ) { }

  ngOnInit(): void {
  }
}
