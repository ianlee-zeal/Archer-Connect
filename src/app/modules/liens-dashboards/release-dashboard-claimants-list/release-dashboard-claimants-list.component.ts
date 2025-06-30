import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ColumnExport } from '@app/models';
import { JobNameEnum, ProductCategory } from '@app/models/enums';
import { SsnPipe } from '@app/modules/shared/_pipes';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ClaimantDetailsRequest, DashboardClaimantsListBase } from '@app/modules/shared/_abstractions';
import { PusherService } from '@app/services/pusher.service';
import { GridId } from '@app/models/enums/grid-id.enum';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { StringHelper } from '@app/helpers';
import * as selectors from './state/selectors';
import * as actions from './state/actions';
import { LienState } from '../state/reducer';

@Component({
  selector: 'app-release-dashboard-claimants-list',
  templateUrl: './release-dashboard-claimants-list.component.html',
  styleUrls: ['./release-dashboard-claimants-list.component.scss'],
})
export class ReleaseDashboardClaimantsListComponent extends DashboardClaimantsListBase<ClaimantDetailsRequest> implements OnInit, OnDestroy {
  @Input() projectId: number;
  @Input() rootProductCategoryId: number;
  @Output() rowDoubleClicked = new EventEmitter();

  public readonly gridId: GridId = GridId.ReleaseDashboardClaimantsList;

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
        headerName: 'In good order?',
        field: 'serviceSummary.inGoodOrder',
        sortable: true,
        suppressSizeToFit: true,
        resizable: true,
        cellRenderer: 'checkboxRenderer',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        minWidth: 105,
      },
      {
        headerName: 'Stage',
        field: 'serviceSummary.releaseOverallStatus',
        width: 100,
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerTooltip: 'Deficiency Status',
        headerName: 'Deficiency Status',
        field: 'serviceSummary.deficiencyStatus',
        width: 150,
        minWidth: 150,
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
    components: { checkboxRenderer: CheckboxEditorRendererComponent },
  };

  constructor(
    store$: Store<LienState>,
    private ssnPipe: SsnPipe,
    router: Router,
    elementRef: ElementRef,
    pusher: PusherService,
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

    this.gridApi = gridApi;

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
        rootProductCategoryId: ProductCategory.Release,
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
