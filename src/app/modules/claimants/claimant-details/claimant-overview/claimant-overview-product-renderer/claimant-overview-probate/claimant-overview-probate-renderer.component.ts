import { Component, Input, OnDestroy } from '@angular/core';
import { LienServiceStatus } from '@app/models/enums/lien-service-status.enum';
import * as fromAuth from '@app/modules/auth/state';
import { Store } from '@ngrx/store';
import { GridApi, GridOptions } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { filter, first, takeUntil } from 'rxjs/operators';
import { AGGridHelper, CurrencyHelper } from '@app/helpers';
import { ClaimantOverviewProbate } from '@app/models/claimant-overview/claimant-overview-probate';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DateFormatPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { LienStageRendererComponent } from '@app/modules/shared/_renderers/lien-stage-renderer/lien-stage-renderer.component';
import { TextWithIconRendererComponent } from '@app/modules/shared/_renderers/text-with-icon-renderer/text-with-icon-renderer.component';
import { Observable, Subject } from 'rxjs';
import { Pager, RelatedPage } from '@app/modules/shared/grid-pager';
import { ActivatedRoute, Params, Router } from '@angular/router';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { commonSelectors } from '@shared/state/common.selectors';
import * as selectors from '../../../state/selectors';
import { ClaimantDetailsState } from '../../../state/reducer';
import { ProductCategory } from '@app/models/enums';

@Component({
  selector: 'app-claimant-overview-probate-renderer',
  templateUrl: './claimant-overview-probate-renderer.component.html',
  styleUrls: ['../claimant-overview-product-renderer.component.scss'],
})
export class ClaimantOverviewProbateRendererComponent implements OnDestroy {
  public readonly statuses = LienServiceStatus;
  public readonly finalizedDate$ = this.store.select(selectors.claimantFinalizedDate);
  public authStore$ = this.store.select(fromAuth.authSelectors.getUser);
  @Input('items') public items$: Observable<ClaimantOverviewProbate[]>;

  public readonly gridId: GridId = GridId.Probates;
  protected gridParams: IServerSideGetRowsParamsExtended;
  private timezone: string;
  protected ngUnsubscribe$ = new Subject<void>();
  private claimantId: number;
  private readonly pager$ = this.store.select(commonSelectors.pager);
  private gridApi: GridApi;

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    defaultColDef: {
      resizable: true,
      autoHeight: true,
      wrapText: true,
      floatingFilter: false,
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'Stage',
        field: 'stage',
        cellRenderer: 'lienStageRenderer',
        cellRendererParams: { wrap: true },
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Service Type',
        field: 'serviceType',
      },
      {
        headerName: 'Allocation',
        field: 'allocation',
        cellRenderer: data => CurrencyHelper.toUsdFormat(data, true),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Special Pay Instr Exist',
        field: 'spiExist',
        cellRenderer: data => this.yesNoPipe.transform(data.value),
      },
      {
        headerName: 'Number of Payees',
        field: 'numPayees',
      },
      {
        headerName: 'Status',
        field: 'status',
      },
      {
        headerName: 'Final Date',
        field: 'finalDate',
        cellRenderer: data => this.datePipe.transform(data.value, false, null, this.timezone, true),
        ...AGGridHelper.dateColumnDefaultParams,
      },
    ],
    components: {
      checkboxRenderer: CheckboxEditorRendererComponent,
      lienStageRenderer: LienStageRendererComponent,
      textWithIconRenderer: TextWithIconRendererComponent,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    private store: Store<ClaimantDetailsState>,
    private datePipe: DateFormatPipe,
    private yesNoPipe: YesNoPipe,
    protected readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {

  }

  public ngOnInit(): void {
    this.authStore$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.timezone = user.timezone && user.timezone.name;
    });

    this.route.parent.parent.parent.params.subscribe((params: Params) => {
      this.claimantId = params.id;
    });
  }

  onGridReady(gridApi: GridApi): void {
    this.gridApi = gridApi;
  }

  protected onRowDoubleClicked({ data: row }): void {
    if (!row || !this.claimantId) {
      return;
    }

    const navSettings = AGGridHelper.getNavSettings(this.gridApi);
    const relatedPage: RelatedPage = RelatedPage.ProbateSummaryFromClaimantOverview;
    let parentPage: RelatedPage;
    this.pager$.pipe(
      first(),
    ).subscribe((pager: Pager) => {
      if (pager) {
        parentPage = pager.relatedPage;
      }
    });

    const payload = {
      id: row.id,
      entityId: this.claimantId,
      parentPage,
    };

    this.store.dispatch(commonActions.CreatePager({
      relatedPage,
      settings: navSettings,
      pager: { payload },
    }));

    this.router.navigate(['claimants', `${this.claimantId}`,
      'services', `${ProductCategory.Probate}`, 'tabs', 'summary']);
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
