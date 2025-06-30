import { Component, Input, OnDestroy } from '@angular/core';

import { LienServiceStatus } from '@app/models/enums/lien-service-status.enum';
import { Store } from '@ngrx/store';
import * as fromAuth from '@app/modules/auth/state';
import { CellRendererSelectorResult, GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community';

import { filter, first, takeUntil } from 'rxjs/operators';
import { GridId } from '@app/models/enums/grid-id.enum';
import { AGGridHelper, CurrencyHelper, IconHelper } from '@app/helpers';
import { ITextWithIconRendererParams, TextWithIconRendererComponent } from '@app/modules/shared/_renderers/text-with-icon-renderer/text-with-icon-renderer.component';
import { DateFormatPipe, BooleanPipe } from '@app/modules/shared/_pipes';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { LienStageRendererComponent } from '@app/modules/shared/_renderers/lien-stage-renderer/lien-stage-renderer.component';
import { Observable, Subject } from 'rxjs';
import { ClaimantOverviewLienItem } from '@app/models/claimant-overview/claimant-overview-lien-item';
import { ClaimantOverviewLienData } from '@app/models/claimant-overview/claimant-overview-lien-data';
import { Pager, RelatedPage } from '@app/modules/shared/grid-pager';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { commonSelectors } from '@shared/state/common.selectors';
import { PermissionTypeEnum, PermissionActionTypeEnum, ProductCategory } from '@app/models/enums';
import { ClaimantDetailsState } from '../../../state/reducer';
import * as selectors from '../../../state/selectors';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-claimant-overview-liens-renderer',
  templateUrl: './claimant-overview-liens-renderer.component.html',
  styleUrls: ['../claimant-overview-product-renderer.component.scss'],
})
export class ClaimantOverviewLiensRendererComponent implements OnDestroy {
  public readonly statuses = LienServiceStatus;
  public readonly finalizedDate$ = this.store.select(selectors.claimantFinalizedDate);
  public authStore$ = this.store.select(fromAuth.authSelectors.getUser);
  private readonly pager$ = this.store.select(commonSelectors.pager);

  private readonly canViewLienPaidDatePermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.LienProducts, PermissionActionTypeEnum.ViewLienPaidDate));

  @Input('items') public items$: Observable<ClaimantOverviewLienItem[]>;
  @Input('lienData') public lienData$: Observable<ClaimantOverviewLienData>;
  @Input('activeClaimant') public activeClaimant: boolean;

  public readonly gridId: GridId = GridId.MedicalLiens;
  private timezone: string;
  private claimantId: number;
  private gridApi: GridApi;

  protected ngUnsubscribe$ = new Subject<void>();

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
        headerName: 'Phase',
        field: 'phase',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Stage',
        field: 'stage',
        cellRenderer: 'lienStageRenderer',
        cellRendererParams: { wrap: true },
        ...AGGridHelper.nameColumnDefaultParams,
        width: 220,
        minWidth: 220,
      },
      {
        headerName: 'Lien ID',
        field: 'lienId',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Lien Category',
        field: 'lienCategory',
        ...AGGridHelper.nameColumnDefaultParams,
        width: 220,
        minWidth: 220,
      },
      {
        headerName: 'Lienholder',
        field: 'lienHolder',
        ...AGGridHelper.nameColumnDefaultParams,
        width: 220,
        minWidth: 220,
      },
      {
        headerName: 'Collector',
        field: 'collector',
        ...AGGridHelper.nameColumnDefaultParams,
        width: 220,
        minWidth: 220,
      },
      {
        headerName: 'On Benefits',
        valueGetter: params => this.booleanPipe.transform(params.data.onBenefits),
        cellRenderer: 'checkboxRenderer',
        width: 110,
        maxWidth: 110,
      },
      {
        headerName: 'Inbound Amount',
        field: 'inboundAmount',
        cellRenderer: data => CurrencyHelper.toUsdIfNumber(data),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Current Amount',
        field: 'currentLienAmount',
        cellRenderer: data => CurrencyHelper.toUsdIfNumber(data),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Final Amount',
        field: 'finalLienAmount',
        cellRenderer: data => CurrencyHelper.toUsdIfNumber(data),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Status',
        field: 'status',
      },
      {
        headerName: 'Deficiencies',
        field: 'deficiencies',
      },
      {
        headerName: 'Lien Paid Date',
        field: 'lienPaid',
        cellRenderer: data => this.datePipe.transform(data.value, false, null, this.timezone, true),
        ...AGGridHelper.dateColumnDefaultParams,
        hide: !this.canViewLienPaidDatePermission,
      },
      {
        headerName: 'Written to Ledger',
        headerTooltip: 'Written to Ledger',
        field: 'writtenToLedger',
        cellRendererSelector: this.writtenToLedgerRenderer.bind(this),
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'center' },
        minWidth: 135,
        width: 135,
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
    private booleanPipe: BooleanPipe,
    protected readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly permissionService: PermissionService,
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

  protected onRowDoubleClicked({ data: row }): void {
    if (!row || !this.activeClaimant) {
      return;
    }

    const navSettings = AGGridHelper.getNavSettings(this.gridApi);
    const relatedPage: RelatedPage = RelatedPage.ReleaseSummaryFromClaimantOverview;
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
      'services', `${ProductCategory.MedicalLiens}`]);
  }

  private writtenToLedgerRenderer(params: ICellRendererParams): CellRendererSelectorResult {
    const p = {
      text: '',
      textFirst: false,
      icon: '',
    } as ITextWithIconRendererParams;
    switch (params.value) {
      case 1:
        p.icon = IconHelper.getWarningIcon();
        break;
      case 2:
        p.text = 'Yes';
        break;
      case 3:
        p.text = 'No';
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

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
