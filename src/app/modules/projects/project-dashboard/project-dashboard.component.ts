import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ProjectsState } from '../state/reducer';
import * as actions from '../state/actions'
import * as selectors from '../state/selectors'
import { filter, take, takeUntil } from 'rxjs/operators';
import { LienStatusSummary, PinnedPage, Project } from '@app/models';
import { combineLatest, Subject } from 'rxjs';
import { QuickSearchOption } from '@shared/_abstractions/quick-search-option';
import * as pinnedPagesActions from '@app/modules/shared/state/pinned-pages/actions';
import { PermissionService } from '@app/services';
import { EntityTypeEnum, PermissionTypeEnum, ProductCategory } from '@app/models/enums';
import { InfoCardState } from '@app/models/enums/info-card-state.enum';
import { IconHelper } from '@app/helpers';
import { sharedActions } from '@shared/state';
import * as fromSharedSelectors from '@shared/state';
import { Document } from '@app/models/documents/document';
import { LoadingIndicatorService } from '@app/services/loading-indicator.service';

import { stagesSummary as resolutionStageSummary } from '@app/modules/liens-dashboards/release-dashboard/state/selectors';
import { GetStagesSummary as GetReleaseStagesSummary } from '@app/modules/liens-dashboards/release-dashboard/state/actions';

import { stagesSummary as lienResolutionStageSummary } from '@app/modules/liens-dashboards/lien-resolution-dashboard/state/selectors';
import { GetStagesSummary as GetLienResolutionStagesSummary } from '@app/modules/liens-dashboards/lien-resolution-dashboard/state/actions';

import { stagesSummary as bankruptcyStageSummary } from '@app/modules/liens-dashboards/bankruptcy-dashboard/state/selectors';
import { GetStagesSummary as GetBankruptcyStagesSummary } from '@app/modules/liens-dashboards/bankruptcy-dashboard/state/actions';
import { CurrentUserOrganizationService } from '@app/services/current-user-organization.service';

import { statusesSummary as probateStageSummary } from '@app/modules/liens-dashboards/probate-dashboard/state/selectors';
import { GetStatusesSummary as GetProbateStagesSummary } from '@app/modules/liens-dashboards/probate-dashboard/state/actions';

import { statusesSummary as qsfAdminStageSummary, totalPaymentChartData } from '@app/modules/liens-dashboards/qsf-admin-dashboard/state/selectors';
import { GetStatusesSummary as GetQsfAdminStagesSummary } from '@app/modules/liens-dashboards/qsf-admin-dashboard/state/actions';
import { TotalPaymentChartData } from '@app/models/liens/total-payment-chart-data';
import * as actionsQSF from '@app/modules/liens-dashboards/qsf-admin-dashboard/state/actions';
import { ChartUtilsBase } from '@app/modules/liens-dashboards/chart-utils-base';
import { chartStylePresets } from '@app/models/fusion-charts/chart-style-presets';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrl: './project-dashboard.component.scss'
})
export class ProjectDashboardComponent extends ChartUtilsBase implements OnInit, OnDestroy {
  private readonly project$ = this.store.select(selectors.item);
  private readonly deficienciesCount$ = this.store.select(selectors.projectDeficienciesCount);
  private readonly ngUnsubscribe$ = new Subject<void>();
  public loading: boolean = true;
  public projectName: string;

  public quickSearchOption: QuickSearchOption[] = [];
  public projectId: number;
  public isPinned: boolean;
  public documents : Document[] = [];
  public deficienciesCount: number;

  public documents$ = this.store.select(fromSharedSelectors.sharedSelectors.documentsListSelectors.documents);
  public readonly canAccessProjectDeficiencies = this.permissionService.canRead(PermissionTypeEnum.ProjectDeficiencies)
  protected loadingDocuments: boolean = true;

  public releaseAdminStatusSummary: LienStatusSummary;
  public lienResolutionStatusSummary: LienStatusSummary;
  public bankruptcyStatusSummary: LienStatusSummary;
  public probateStatusSummary: LienStatusSummary;
  public qsfAdminStatusSummary: LienStatusSummary;
  public totalPaymentChartSummary: TotalPaymentChartData;
  public totalPaymentChart;

  private readonly resolutionStageSummary$ = this.store.select(resolutionStageSummary);
  private readonly lienResolutionStageSummary$ = this.store.select(lienResolutionStageSummary);
  private readonly bankruptcyStageSummary$ = this.store.select(bankruptcyStageSummary);
  private readonly probateStageSummary$ = this.store.select(probateStageSummary);
  private readonly qsfAdminStageSummary$ = this.store.select(qsfAdminStageSummary);
  private readonly totalPaymentChartData$ = this.store.select(totalPaymentChartData);

  public preventPopoverPanelClose: boolean = false;
  public selectedService: ProductCategory | null = null;
  public selectedLienStatusSummary: LienStatusSummary | null = null;

  public readonly ProductCategory = ProductCategory;
  public readonly EntityTypeEnum = EntityTypeEnum;
  public readonly InfoCardState = InfoCardState;
  public readonly IconHelper = IconHelper;

  constructor(
    private readonly store: Store<ProjectsState>,
    private readonly permissionService: PermissionService,
    private readonly router: Router,
    private readonly currentUserOrganizationService: CurrentUserOrganizationService,
    private readonly loadingIndicatorService: LoadingIndicatorService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.store.dispatch(actions.ShowInfoBar({ show: false }));

    this.project$
      .pipe(
        filter((project: Project) => !!project),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe((project: Project) => {
        this.projectName = project.name;
        this.projectId = project.id;
        this.isPinned = project.isPinned;

        const agGridParams = {
          parentNode: null,
          success() { },
          fail() { },
          api: null,
          context: null,
          request: {
            startRow: 0,
            endRow: 6,
            rowGroupCols: [],
            valueCols: [],
            pivotCols: [],
            pivotMode: false,
            groupKeys: [],
            filterModel: [],
            sortModel: [{ sort: 'desc' as const, colId: 'createdDate' }],
          }
        };

        if (!this.currentUserOrganizationService.isMaster) {
          this.store.dispatch(sharedActions.documentsListActions.UpdateDocumentsListSearch({ search: { entityId: this.projectId } }));
        }

        this.store.dispatch(sharedActions.documentsListActions.GetDocumentsList({ agGridParams }));
        this.store.dispatch(actionsQSF.GetTotalPaymentChartData({projectId: this.projectId}));

        this.quickSearchOption = [
          {
            id: EntityTypeEnum.ProjectClaimantSummary,
            name: 'Claimants',
            active: true,
            payload: this.projectId,
            displayField: 'fullName',
            placeholder: 'Search by ID, Name, SSN or Attorney Reference ID',
          }
        ];

        this.loadServicesSummaries();
      });

    combineLatest([
      this.deficienciesCount$.pipe(filter((deficienciesCount: number) => deficienciesCount !== undefined), take(1)),
      this.resolutionStageSummary$,
      this.lienResolutionStageSummary$,
      this.bankruptcyStageSummary$,
      this.probateStageSummary$,
      this.qsfAdminStageSummary$,
    ])
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(([deficienciesCount, releaseSummary, lienSummary, bankruptcySummary, probateSummary, qsfSummary]: [ number, LienStatusSummary, LienStatusSummary, LienStatusSummary, LienStatusSummary, LienStatusSummary ]) => {
          this.deficienciesCount = deficienciesCount;
          this.releaseAdminStatusSummary = releaseSummary;
          this.lienResolutionStatusSummary = lienSummary;
          this.bankruptcyStatusSummary = bankruptcySummary;
          this.probateStatusSummary = probateSummary;
          this.qsfAdminStatusSummary = qsfSummary;

          this.loading = !this.isAllServicesLoaded;
          if (!this.loading) {
            this.loadingIndicatorService.hide();
          }
        }
      );

    this.documents$.pipe(
      filter(documents => !!documents),
      takeUntil(this.ngUnsubscribe$)
    ).subscribe((documents: Document[]) => {
      this.documents = documents;
      this.loadingDocuments = false;
    });

    this.paymentsChartSubscription();
  }

  private paymentsChartSubscription(): void {
    this.totalPaymentChartData$
      .pipe(filter(totalPaymentChartData => !!totalPaymentChartData),takeUntil(this.ngUnsubscribe$))
      .subscribe(totalPaymentChartData => {
          this.totalPaymentChartSummary = totalPaymentChartData;
          this.totalPaymentChart = this.getTotalPaymentChart(totalPaymentChartData);
      });
  }

  onTrackerSelected(service: ProductCategory, lienStatusSummary: LienStatusSummary) {
    this.preventPopoverPanelClose = true;
    this.selectedService = this.selectedService === service ? null : service;
    this.selectedLienStatusSummary = this.selectedLienStatusSummary === lienStatusSummary ? null : lienStatusSummary;
  }

  private get isAllServicesLoaded(): boolean {
    return !!(this.releaseAdminStatusSummary && this.bankruptcyStatusSummary && this.lienResolutionStatusSummary && this.probateStatusSummary && this.qsfAdminStatusSummary);
  }

  private loadServicesSummaries(): void {
    this.store.dispatch(GetReleaseStagesSummary({ rootProductCategoryId: ProductCategory.Release, projectId: this.projectId }));
    this.store.dispatch(GetBankruptcyStagesSummary({ rootProductCategoryId: ProductCategory.Bankruptcy, projectId: this.projectId }));
    this.store.dispatch(GetLienResolutionStagesSummary({ rootProductCategoryId: ProductCategory.MedicalLiens, projectId: this.projectId }));
    this.store.dispatch(GetProbateStagesSummary({ rootProductCategoryId: ProductCategory.Probate, projectId: this.projectId }));
    this.store.dispatch(GetQsfAdminStagesSummary({ rootProductCategoryId: ProductCategory.QSFAdministration, projectId: this.projectId }));
  }

  public onOutsideClick(): void {
    if(!this.preventPopoverPanelClose){
      this.selectedService = null;
      this.selectedLienStatusSummary = null;
    }
    this.preventPopoverPanelClose = false;
  }

  public onClickContact(): void {
    const email = "clientcare@archersystems.com";
    const subject = encodeURIComponent(`ARROW Inquiry: ${this.projectName}`);

    window.location.href = `mailto:${email}?subject=${subject}`;
  }

  public onClickDeficienciesCard(): void {
    this.router.navigate([`projects/${this.projectId}/portal-deficiencies/tabs/deficiencies-list`]);
  }

  pinPage(): void {
    this.store.dispatch(pinnedPagesActions.CreatePinnedPage({
      view: <PinnedPage>{
        entityId: this.projectId,
        entityTypeId: EntityTypeEnum.Projects,
        url: `/projects/${this.projectId}`,
      },
      callback: () => {
        this.isPinned = true;
      },
    }))
  }

  removePin(): void{
    this.store.dispatch(pinnedPagesActions.RemovePinnedPage({
      entityId: this.projectId,
      entityType: EntityTypeEnum.Projects,
      callback: () => {
        this.isPinned = false;
      },
    }))
  }

  public onClickDownload(documentId: number): void {
    this.store.dispatch(actions.GetValidationDocument({ previewDocId: documentId }));
  }

  public goToProjectDocuments(): void {
    this.router.navigate([`projects/${this.projectId}/overview/tabs/documents`]);
  }

  private getTotalPaymentChart(summary: TotalPaymentChartData): any {
    const charProps = { subCaption: 'Payments Last 3 Months' }
    return this.getTotalPaymentChartDefinition(summary, charProps, chartStylePresets.orangeDash);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.store.dispatch(actions.ShowInfoBar({ show: true }));
  }
}
