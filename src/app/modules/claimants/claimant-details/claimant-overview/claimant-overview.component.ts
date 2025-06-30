import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, filter, takeUntil } from 'rxjs';

import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { ActivatedRoute } from '@angular/router';
import { Claimant } from '@app/models/claimant';
import * as actions from '../state/actions';
import { ClaimantDetailsState } from '../state/reducer';
import * as selectors from '../state/selectors';

@Component({
  selector: 'app-claimant-overview',
  templateUrl: './claimant-overview.component.html',
  styleUrls: ['./claimant-overview.component.scss'],
})
export class ClaimantOverviewComponent implements OnInit, OnDestroy {
  public readonly claimantOverviewPaymentItems$ = this.store.select(selectors.claimantOverviewPaymentItems);
  public readonly claimantOverviewBankruptcyItems$ = this.store.select(selectors.claimantOverviewBankruptcyItems);
  public readonly claimantOverviewLiensData$ = this.store.select(selectors.claimantOverviewLiensData);
  public readonly claimantOverviewLiensItems$ = this.store.select(selectors.claimantOverviewLiensItems);
  public readonly claimantOverviewReleaseAdmin$ = this.store.select(selectors.claimantOverviewReleaseAdmin);
  public readonly claimantOverviewReleaseAdminItems$ = this.store.select(selectors.claimantOverviewReleaseAdminItems);
  public readonly claimantOverviewProbateItems$ = this.store.select(selectors.claimantOverviewProbateItems);
  public readonly claimantOverviewQSFData$ = this.store.select(selectors.claimantOverviewQSFData);
  public readonly claimantOverviewQSFItems$ = this.store.select(selectors.claimantOverviewQSFItems);
  public readonly claimantOverviewInvoicingDetails$ = this.store.select(selectors.claimantOverviewInvoicingDetails);
  public readonly claimantOverviewInvoicingDetailsItems$ = this.store.select(selectors.claimantOverviewInvoicingDetailsItems);
  public readonly engagedServicesIds$ = this.store.select(selectors.engagedServicesIds);

  public readonly viewInvoicingDetailsPermission = PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.ClaimantInvoicingDetails);

  public readonly services$ = this.store.select(selectors.services);
  public readonly isLoadedClaimantOverview$ = this.store.select(selectors.isLoadedClaimantOverview);
  private readonly ngUnsubscribe$ = new Subject<void>();
  public readonly claimant$ = this.store.select(selectors.item);

  public claimant: Claimant;

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private readonly route: ActivatedRoute,
  ) {
  }

  public ngOnInit(): void {
    this.route.parent.parent.parent.params.subscribe(params => {
      this.store.dispatch(actions.GetClaimantDashboardOverview({ claimantId: params.id }));
    });
    this.store.dispatch(actions.ToggleClaimantSummaryBar({ isExpanded: true }));
    this.claimant$.pipe(
      filter((claimant: Claimant) => !!claimant),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((item: Claimant) => {
      this.claimant = item;
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();

    this.store.dispatch(actions.ResetClaimantDashboardOverviewAdditionalInfo());
  }
}
