import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { Store } from '@ngrx/store';
import * as actions from '@app/modules/claimants/claimant-details/state/actions';
import * as fromClaimants from '@app/modules/claimants/claimant-details/state/selectors';
import { filter, takeUntil } from 'rxjs/operators';
import { Claimant } from '@app/models/claimant';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import * as selectors from '../claimant-details/state/selectors';
import { InfoCardState } from '@app/models/enums/info-card-state.enum';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum, ProductCategory } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { PinnedPage } from '@app/models';
import * as pinnedPagesActions from '@app/modules/shared/state/pinned-pages/actions';

@Component({
  selector: 'app-claimant-dashboard',
  templateUrl: './claimant-dashboard.component.html',
  styleUrls: ['./claimant-dashboard.component.scss']
})
export class ClaimantDashboardComponent implements OnInit, OnDestroy {
  showMainDashboard = true;
  public claimant$ = this.store.select(fromClaimants.item);
  private readonly ngUnsubscribe$ = new Subject<void>();
  infoCardState = InfoCardState;
  public ProductCategory = ProductCategory;
  public isPinned: boolean;

  public claimantId: number;
  public projectId: number;
  public title: string;
  public subTitle: string;

  public readonly claimantOverviewPaymentItems$ = this.store.select(fromClaimants.claimantOverviewPaymentItems);
  public readonly claimantOverviewBankruptcyItems$ = this.store.select(selectors.claimantOverviewBankruptcyItems);
  public readonly claimantOverviewLiensData$ = this.store.select(selectors.claimantOverviewLiensData);
  public readonly claimantOverviewReleaseAdmin$ = this.store.select(selectors.claimantOverviewReleaseAdmin);
  public readonly claimantOverviewReleaseAdminItems$ = this.store.select(selectors.claimantOverviewReleaseAdminItems);
  public readonly claimantOverviewProbateItems$ = this.store.select(selectors.claimantOverviewProbateItems);
  public readonly claimantOverviewQSFData$ = this.store.select(selectors.claimantOverviewQSFData);
  public readonly engagedServicesIds$ = this.store.select(selectors.engagedServicesIds);
  public readonly uncuredDeficienciesCount$ = this.store.select(selectors.uncuredDeficienciesCount);
  public readonly isLoadedClaimantOverview$ = this.store.select(selectors.isLoadedClaimantOverview);

  deficiencyPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.ClaimantDeficiencies, PermissionActionTypeEnum.Read));

  private engagedServicesIds: number[];

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly permissionService: PermissionService
  ) {
    this.router.events.subscribe(() => {
      this.showMainDashboard = this.route.children.length === 0;
    });
  }

  ngOnInit() {

    this.store.dispatch(actions.ShowInfoBar({ show: false }));

    this.route.parent.params.subscribe(params => {
      this.store.dispatch(actions.GetClaimantDashboardOverview({ claimantId: params.id }));
      this.deficiencyPermission ? this.store.dispatch(actions.GetPortalDeficienciesCount({ clientId: params.id })) : null;
    });

    this.claimant$
      .pipe(
        filter((item: Claimant) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((claimant: Claimant) => {
        this.claimantId = claimant.id;
        this.title = claimant.fullName;
        this.projectId = claimant.project.id;
        this.subTitle = claimant.project && claimant.project.name;
        this.isPinned = claimant.isPinned;
      });

    this.engagedServicesIds$
      .pipe(
        filter((ids: number[]) => !!ids),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((ids: number[]) => {
        this.engagedServicesIds = ids;
      });
  }

  goToProject() {
    this.router.navigate(['/projects', this.projectId]);
  }

  pinPage() {
    this.store.dispatch(pinnedPagesActions.CreatePinnedPage({
      view: <PinnedPage>{
        entityId: this.claimantId,
        entityTypeId: EntityTypeEnum.Clients,
        url: `/claimants/${this.claimantId}`,
      },
      callback: () => {
        this.isPinned = true;
      },
    }))
  }

  removePin(){
    this.store.dispatch(pinnedPagesActions.RemovePinnedPage({
      entityId: this.claimantId,
      entityType: EntityTypeEnum.Clients,
      callback: () => {
        this.isPinned = false;
      },
    }))
  }

  protected isServiceEngaged(serviceId: ProductCategory): boolean {
      return this.engagedServicesIds?.includes(serviceId);
    }

  ngOnDestroy() {
    this.store.dispatch(actions.ShowInfoBar({ show: true }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
