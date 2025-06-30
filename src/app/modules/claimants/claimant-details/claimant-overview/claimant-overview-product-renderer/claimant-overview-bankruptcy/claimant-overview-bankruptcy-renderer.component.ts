import { Component, Input, OnDestroy } from '@angular/core';

import { LienServiceStatus } from '@app/models/enums/lien-service-status.enum';
import { Store } from '@ngrx/store';
import * as fromAuth from '@app/modules/auth/state';
import { CellRendererSelectorResult, GridApi, GridOptions, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { filter, first, takeUntil } from 'rxjs/operators';
import { AGGridHelper, CurrencyHelper, IconHelper } from '@app/helpers';
import { ClaimantOverviewBankruptcy } from '@app/models/claimant-overview/claimant-overview-bankruptcy';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DateFormatPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { LienStageRendererComponent } from '@app/modules/shared/_renderers/lien-stage-renderer/lien-stage-renderer.component';
import { TextWithIconRendererComponent, ITextWithIconRendererParams } from '@app/modules/shared/_renderers/text-with-icon-renderer/text-with-icon-renderer.component';
import { Observable, Subject } from 'rxjs';
import { Pager, RelatedPage } from '@app/modules/shared/grid-pager';
import { ActivatedRoute, Params, Router } from '@angular/router';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { commonSelectors } from '@shared/state/common.selectors';
import { ProductCategory } from '@app/models/enums';
import * as selectors from '../../../state/selectors';
import { ClaimantDetailsState } from '../../../state/reducer';

@Component({
  selector: 'app-claimant-overview-bankruptcy-renderer',
  templateUrl: './claimant-overview-bankruptcy-renderer.component.html',
  styleUrls: ['../claimant-overview-product-renderer.component.scss'],
})
export class ClaimantOverviewBankruptcyRendererComponent implements OnDestroy {
  public readonly statuses = LienServiceStatus;
  public readonly finalizedDate$ = this.store.select(selectors.claimantFinalizedDate);
  public authStore$ = this.store.select(fromAuth.authSelectors.getUser);
  @Input('items') public items$: Observable<ClaimantOverviewBankruptcy[]>;

  public readonly gridId: GridId = GridId.Bankruptcies;
  protected gridParams: IServerSideGetRowsParamsExtended;
  private timezone: string;
  protected ngUnsubscribe$ = new Subject<void>();

  private gridApi: GridApi;
  private claimantId: number;
  private readonly pager$ = this.store.select(commonSelectors.pager);

  public readonly gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      resizable: true,
      floatingFilter: false,
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'Stage',
        field: 'stage',
        cellRenderer: 'lienStageRenderer',
        cellRendererParams: { wrap: true },
        suppressSizeToFit: true,
      },
      {
        headerName: 'Allocation',
        headerTooltip: 'Allocation',
        field: 'allocation',
        cellRenderer: data => CurrencyHelper.toUsdIfNumber(data),
        ...AGGridHelper.rightAlignedParams,
      },
      {
        headerName: 'Final Date',
        headerTooltip: 'Final Date',
        valueGetter: (params: ValueGetterParams): string => this.datePipe.transform(params.data.finalDate, false, null, this.timezone, true),
      },
      {
        headerName: 'Abandoned',
        headerTooltip: 'Abandoned',
        valueGetter: (params: ValueGetterParams): string => this.yesNoPipe.transform(params.data.abandoned),
        minWidth: 90,
        width: 90,
      },
      {
        headerName: 'Closing Statement Needed',
        headerTooltip: 'Closing Statement Needed',
        valueGetter: (params: ValueGetterParams): string => this.yesNoPipe.transform(params.data.closingStatementNeeded),
      },
      {
        headerName: 'Ready to pay Trustee',
        headerTooltip: 'Ready to pay Trustee',
        valueGetter: (params: ValueGetterParams): string => this.yesNoPipe.transform(params.data.readyToPayTrustee),
      },
      {
        headerName: 'Trustee Amount',
        headerTooltip: 'Trustee Amount',
        field: 'trusteeAmount',
        cellRenderer: data => CurrencyHelper.toUsdIfNumber(data),
        ...AGGridHelper.rightAlignedParams,
      },
      {
        headerName: 'Attorney Amount',
        headerTooltip: 'Attorney Amount',
        field: 'attorneyAmount',
        cellRenderer: data => CurrencyHelper.toUsdIfNumber(data),
        ...AGGridHelper.rightAlignedParams,
      },
      {
        headerName: 'Claimant Amount',
        headerTooltip: 'Claimant Amount',
        field: 'claimantAmount',
        cellRenderer: data => CurrencyHelper.toUsdIfNumber(data),
        ...AGGridHelper.rightAlignedParams,
        minWidth: 150,
      },
      {
        headerName: 'Special Payment Instructions Exist',
        headerTooltip: 'Special Payment Instructions Exist',
        field: 'spiExist',
        cellRendererSelector: this.spiRenderer.bind(this),
      },
    ],
    onGridSizeChanged: this.onGridSizeChanged.bind(this),
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

  private spiRenderer(params: ICellRendererParams): CellRendererSelectorResult {
    const p = {
      text: '',
      textFirst: false,
      icon: '',
    } as ITextWithIconRendererParams;
    switch (params.value) {
      case false:
        p.icon = IconHelper.getWarningIcon();
        p.text = 'No';
        break;
      case true:
        p.text = 'Yes';
        break;
      default:
        p.text = 'N/A';
        break;
    }
    return {
      component: 'textWithIconRenderer',
      params: p,
    };
  }

  onGridReady(gridApi: GridApi): void {
    this.gridApi = gridApi;
  }

  onGridSizeChanged(): void {
    if (this.gridApi) {
      this.gridApi.autoSizeAllColumns();
      this.gridApi.sizeColumnsToFit();
    }
  }

  protected onRowDoubleClicked({ data: row }): void {
    if (!row || !this.claimantId) {
      return;
    }

    const navSettings = AGGridHelper.getNavSettings(this.gridApi);
    const relatedPage: RelatedPage = RelatedPage.BankruptcySummaryFromClaimantOverview;
    let parentPage: RelatedPage;
    this.pager$.pipe(
      first((pager: Pager) => !!pager),
    ).subscribe((pager: Pager) => {
      parentPage = pager.relatedPage;
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
      'services', `${ProductCategory.Bankruptcy}`, 'tabs', 'summary']);
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
