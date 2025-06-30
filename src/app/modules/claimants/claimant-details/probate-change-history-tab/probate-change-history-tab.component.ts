import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as selectors from '@app/modules/claimants/claimant-details/state/selectors';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ProductCategory } from '@app/models/enums';
import * as claimantActions from '@app/modules/claimants/claimant-details/state/actions';
import { Router } from '@angular/router';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ClaimantDetailsState } from '../state/reducer';
import * as actions from '../state/actions';

@Component({
  selector: 'app-probate-change-history-tab',
  templateUrl: './probate-change-history-tab.component.html',
})
export class ProbateChangeHistoryTabComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe$ = new Subject<void>();

  public probateId;
  public productCategory = ProductCategory.Probate;

  readonly probateDetailsItem$ = this.store.select(selectors.probateDetailsItem);

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const id = Number(this.router.url.split('/').filter(value => value)[1]);

    this.store.dispatch(claimantActions.GetProbateDetailsByClientId({ clientId: id }));

    this.probateDetailsItem$
      .pipe(
        filter(probateDetails => !!probateDetails),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(probateDetails => {
        this.probateId = probateDetails.id;
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onActionBarUpdated(actionBar: ActionHandlersMap): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar }));
  }
}
