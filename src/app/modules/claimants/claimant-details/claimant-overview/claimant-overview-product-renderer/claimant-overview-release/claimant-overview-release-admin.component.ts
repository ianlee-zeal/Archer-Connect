import { Component, Input, OnInit } from '@angular/core';

import { LienServiceStatus } from '@app/models/enums/lien-service-status.enum';
import { GridApi, GridOptions } from 'ag-grid-community';

import { GridId } from '@app/models/enums/grid-id.enum';
import { AGGridHelper, CurrencyHelper } from '@app/helpers';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { LienStageRendererComponent } from '@app/modules/shared/_renderers/lien-stage-renderer/lien-stage-renderer.component';
import { Observable, first } from 'rxjs';
import { ClaimantOverviewReleaseAdminItem } from '@app/models/claimant-overview/claimant-overview-release-admin-item';
import { ClaimantOverviewReleaseAdmin } from '@app/models/claimant-overview/claimant-overview-release-admin';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Pager, RelatedPage } from '@app/modules/shared/grid-pager';
import { Store } from '@ngrx/store';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { commonSelectors } from '@shared/state/common.selectors';
import { ProductCategory } from '@app/models/enums';
import { ClaimantDetailsState } from '../../../state/reducer';

@Component({
  selector: 'app-claimant-overview-release-admin',
  templateUrl: './claimant-overview-release-admin.component.html',
  styleUrls: ['../claimant-overview-product-renderer.component.scss'],
})
export class ClaimantOverviewReleaseAdminComponent implements OnInit {
  public readonly statuses = LienServiceStatus;

  @Input('items') public items$: Observable<ClaimantOverviewReleaseAdminItem[]>;
  @Input('releaseAdmin') public releaseAdmin$: Observable<ClaimantOverviewReleaseAdmin>;

  public readonly gridId: GridId = GridId.ClaimantOverviewReleaseAdmin;

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
        cellRenderer: data => CurrencyHelper.toUsdFormat(data, true),
        ...AGGridHelper.rightAlignedParams,
      },
      {
        headerName: '# of Allocations',
        headerTooltip: '# of Allocations',
        field: 'numberOfAllocation',
      },
      {
        headerName: 'In Good Order',
        headerTooltip: 'In Good Order',
        field: 'inGoodOrder',
      },
      {
        headerName: 'Date Mailed to Claimant',
        headerTooltip: 'Date Mailed to Claimant',
        field: 'dateMailedToClaimant',
        cellRenderer: data => this.datePipe.transform(data.value, false),
        minWidth: 170,
      },
      {
        headerName: 'Release Rec\'d',
        headerTooltip: 'Release Rec\'d',
        field: 'releaseRec',
        cellRenderer: data => this.datePipe.transform(data.value, false),
        minWidth: 170,
      },
      {
        headerName: 'Submitted to Defense',
        headerTooltip: 'Submitted to Defense',
        field: 'submittedToDefense',
        cellRenderer: data => this.datePipe.transform(data.value, false),
        minWidth: 170,
      },
      {
        headerName: 'Defense Approval Date',
        headerTooltip: 'Defense Approval Date',
        field: 'defenseApprovalDate',
        cellRenderer: data => this.datePipe.transform(data.value, false),
        minWidth: 170,
      },
    ],
    onGridSizeChanged: this.onGridSizeChanged.bind(this),
    components: {
      lienStageRenderer: LienStageRendererComponent,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    private store: Store<ClaimantDetailsState>,
    private datePipe: DateFormatPipe,
    protected readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {

  }

  public ngOnInit(): void {
    this.route.parent.parent.parent.params.subscribe((params: Params) => {
      this.claimantId = params.id;
    });
  }

  protected onRowDoubleClicked({ data: row }): void {
    if (!row || !this.claimantId) {
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
      'services', `${ProductCategory.Release}`, 'tabs', 'summary']);
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
}
