import { Component, Input, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';

import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { DateFormatPipe, SsnPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ClaimantDetailsRequest, DashboardClaimantsListBase } from '@app/modules/shared/_abstractions';
import { ColumnExport } from '@app/models';
import { JobNameEnum, ProductCategory } from '@app/models/enums';
import { PusherService } from '@app/services/pusher.service';
import { GridId } from '@app/models/enums/grid-id.enum';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { CurrencyHelper, StringHelper } from '@app/helpers';
import { LienState } from '../state/reducer';
import * as actions from './state/actions';
import * as selectors from './state/selectors';

@Component({
  selector: 'app-qsf-admin-dashboard-claimants-list',
  templateUrl: './qsf-admin-dashboard-claimants-list.component.html',
  styleUrls: ['./qsf-admin-dashboard-claimants-list.component.scss'],
})
export class QsfAdminDashboardClaimantsListComponent extends DashboardClaimantsListBase<ClaimantDetailsRequest> implements OnInit, OnDestroy {
  @Input() projectId: number;
  @Input() rootProductCategoryId: number;

  public readonly gridId: GridId = GridId.QsfAdminDashboardClaimantsList;

  public clients$ = this.store$.select(selectors.clients);
  public ngUnsubscribe$ = new Subject<void>();

  public gridOptions: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        headerName: 'Client ID',
        field: 'id',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Attorney Ref ID',
        field: 'attorneyReferenceId',
        width: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
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
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Overall QSF Status',
        field: 'serviceSummary.qsfAdminOverallStatus',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Attorney F&E Total',
        field: 'serviceSummary.attorneyFETotal',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.renderAmountAsExcel(data),
        cellClass: params => (params.data?.serviceSummary?.attorneyFETotal < 0) && 'ag-cell-red',
        width: 135,
        minWidth: 135,
        ...AGGridHelper.rightAlignedParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
      },
      {
        headerName: 'Attorney F&E Unpaid Total',
        field: 'serviceSummary.unpaidAttorneyFETotal',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.renderAmountAsExcel(data),
        cellClass: params => (params.data?.serviceSummary?.unpaidAttorneyFETotal < 0) && 'ag-cell-red',
        width: 200,
        minWidth: 200,
        ...AGGridHelper.rightAlignedParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: { checkboxRenderer: CheckboxEditorRendererComponent },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    store$: Store<LienState>,
    private ssnPipe: SsnPipe,
    router: Router,
    elementRef : ElementRef,
    private dateFormat: DateFormatPipe,
    pusher: PusherService,
    private readonly yesNoPipe: YesNoPipe,
  ) {
    super(store$, router, elementRef, pusher);
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
    if (!this.projectId) {
      return;
    }
    this.raiseFilterChangedEvent(params);
    this.store$.dispatch(actions.GetClaimantsList({ projectId: this.projectId, rootProductCategoryId: this.rootProductCategoryId, agGridParams: params, bypassSpinner: true }));
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
  }

  public canClearGridFilters(): boolean {
    return this.canClearFilters();
  }

  downloadClaimants(params: IServerSideGetRowsParamsExtended, columnsParam: ColumnExport[]): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportClientsByCaseService, this.projectId, this.rootProductCategoryId);
    this.export(channelName, () => {
      this.store$.dispatch(actions.DownloadClaimants({
        channelName,
        agGridParams: params,
        columns: columnsParam,
        rootProductCategoryId: ProductCategory.QSFAdministration,
        projectId: this.projectId,
      }));
    });
  }

  downloadClaimantsDocument(id: number): void {
    this.store$.dispatch(actions.DownloadClaimantsDocument({ id }));
  }

  onError(errorMessage: string): void {
    this.store$.dispatch(actions.Error({ errorMessage }));
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
