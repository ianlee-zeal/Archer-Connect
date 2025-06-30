import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ClaimantDetailsRequest, DashboardClaimantsListBase } from '@app/modules/shared/_abstractions';
import { ColumnExport } from '@app/models';
import { JobNameEnum, ProductCategory, StatusEnum } from '@app/models/enums';
import { PusherService } from '@app/services/pusher.service';
import { GridId } from '@app/models/enums/grid-id.enum';
import { CurrencyHelper, StringHelper } from '@app/helpers';
import { LienState } from '../state/reducer';
import * as actions from './state/actions';
import * as selectors from './state/selectors';

@Component({
  selector: 'app-dashboard-claimants-list',
  templateUrl: './dashboard-claimants-list.component.html',
  styleUrls: ['./dashboard-claimants-list.component.scss'],
})
export class DashboardClaimantsListComponent extends DashboardClaimantsListBase<ClaimantDetailsRequest> implements OnInit, OnDestroy {
  readonly ngUnsubscribe$ = new Subject<void>();

  @Input() projectId: number;
  @Input() rootProductCategoryId: number;
  @Output() rowDoubleClicked = new EventEmitter();

  public readonly gridId: GridId = GridId.ProbateDashboardClaimantsList;
  public readonly clients$ = this.store$.select(selectors.clients);

  public gridOptions: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        headerName: 'Client ID',
        field: 'id',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'ARCHER ID',
        field: 'archerId',
        width: 100,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        minWidth: 300,
        sortable: true,
        sort: 'asc',
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        minWidth: 300,
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'SSN',
        field: 'cleanSsn',
        width: 120,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ stripDashes: true }),
      },
      {
        headerName: 'Primary Firm',
        field: 'org.name',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Settlement Amount',
        field: 'totalAllocation',
        sortable: true,
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Date of Death',
        field: 'dateOfDeath',
        colId: 'dod',
        minWidth: 100,
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerTooltip: 'Overall Status',
        headerName: 'Overall Status',
        field: 'serviceSummary.probateOverallStatus',
        minWidth: 100,
        width: 100,
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Type',
        field: 'serviceSummary.product',
        minWidth: 150,
        width: 150,
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    store: Store<LienState>,
    router: Router,
    elementRef: ElementRef,
    pusher: PusherService,
    private readonly datePipe: DateFormatPipe,
  ) {
    super(store, router, elementRef, pusher);
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (this.rootProductCategoryId === ProductCategory.Probate) {
      this.gridOptions.columnDefs.push({
        headerName: 'Status',
        field: 'serviceSummary.probateStatus.name',
        colId: 'serviceSummary.probateStatus.id',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getDropdownColumnFilter({
          defaultValue: StatusEnum.ProbateActive,
          options: [
            {
              id: StatusEnum.ProbateActive,
              name: 'Active',
            },
            {
              id: StatusEnum.ProbateInactive,
              name: 'Inactive',
            },
          ],
        }),
      });
    }
  }

  public ngOnChanges(): void {
    if (this.gridApi) {
      this.gridApi.refreshServerSide({ purge: true });
    }
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.raiseFilterChangedEvent(params);
    this.store$.dispatch(actions.GetClaimantsList({ projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, agGridParams: params }));
  }

  public onRowDoubleClicked(event): void {
    const navSettings = AGGridHelper.getNavSettings(this.gridApi);
    const claimantDetailsRequest: ClaimantDetailsRequest = {
      id: event.data.id,
      projectId: this.projectId,
      rootProductCategoryId: this.rootProductCategoryId,
      navSettings,
      gridParamsRequest: this.gridParams.request,
      clientStages: null,
      lienPhases: null,
      lienType: null,
    };
    this.goToDetails.emit(claimantDetailsRequest);
  }

  public clearGridFilters(): void {
    this.clearFilters();

    if (this.gridApi) {
      this.gridApi.setFilterModel(null);
     }
  }

  public canClearGridFilters(): boolean {
    return this.canClearFilters();
  }

  downloadClaimants(params: IServerSideGetRowsParamsExtended, columnsParam: ColumnExport[]) {
    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportClientsByCaseService, this.projectId, this.rootProductCategoryId);
    this.export(channelName, () => {
      this.store$.dispatch(actions.DownloadClaimants({
        channelName,
        agGridParams: params,
        columns: columnsParam,
        rootProductCategoryId: ProductCategory.Probate,
      }));
    });
  }

  downloadClaimantsDocument(id: number) {
    this.store$.dispatch(actions.DownloadClaimantsDocument({ id }));
  }

  onError(errorMessage: string) {
    this.store$.dispatch(actions.Error({ errorMessage }));
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
