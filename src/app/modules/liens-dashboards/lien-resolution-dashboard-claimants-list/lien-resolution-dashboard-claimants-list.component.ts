import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ClaimantDetailsRequest, DashboardClaimantsListBase } from '@app/modules/shared/_abstractions';
import { ColumnExport } from '@app/models';
import { JobNameEnum, ProductCategory } from '@app/models/enums';
import { PusherService } from '@app/services/pusher.service';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DecimalPipe } from '@angular/common';
import { StringHelper } from '@app/helpers';
import { LienState } from '../state/reducer';
import * as actions from './state/actions';
import * as selectors from './state/selectors';

@Component({
  selector: 'app-lien-resolution-dashboard-claimants-list',
  templateUrl: './lien-resolution-dashboard-claimants-list.component.html',
  styleUrls: ['./lien-resolution-dashboard-claimants-list.component.scss'],
})
export class LienResolutionDashboardClaimantsListComponent extends DashboardClaimantsListBase<ClaimantDetailsRequest> implements OnInit, OnDestroy {
  @Input() projectId: number;
  @Input() rootProductCategoryId: number;
  @Output() rowDoubleClicked = new EventEmitter();

  public readonly gridId: GridId = GridId.LienResolutionDashboardClaimantsList;

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
        minWidth: 100,
        sortable: true,
        sort: 'asc',
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        minWidth: 100,
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
        headerTooltip: 'Overall Status',
        headerName: 'Overall Status',
        field: 'serviceSummary.medicalLiensOverallStatus',
        minWidth: 100,
        width: 100,
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Total Liens',
        headerTooltip: 'Total Liens',
        field: 'serviceSummary.totalLiens',
        minWidth: 30,
        width: 70,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        sortable: true,
        resizable: true,
        valueFormatter: data => this.dacimalPipe.transform(data.value),
      },
      {
        headerTooltip: 'Pending Liens',
        headerName: 'Pending Liens',
        field: 'serviceSummary.pendingLiens',
        minWidth: 100,
        width: 100,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        sortable: true,
        resizable: true,
        valueFormatter: data => this.dacimalPipe.transform(data.value),
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  constructor(
    store$: Store<LienState>,
    router: Router,
    elementRef : ElementRef,
    pusher: PusherService,
    protected readonly dacimalPipe: DecimalPipe,
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
    this.raiseFilterChangedEvent(params);
    this.store$.dispatch(actions.GetClaimantsList({
      projectId: this.projectId,
      rootProductCategoryId: this.rootProductCategoryId,
      agGridParams: params,
    }));
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

  downloadClaimants(params: IServerSideGetRowsParamsExtended, columnsParam: ColumnExport[]) {
    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportClientsByCaseService, this.projectId, this.rootProductCategoryId);
    this.export(channelName, () => {
      this.store$.dispatch(actions.DownloadClaimants({
        channelName,
        agGridParams: params,
        columns: columnsParam,
        rootProductCategoryId: ProductCategory.MedicalLiens,
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
