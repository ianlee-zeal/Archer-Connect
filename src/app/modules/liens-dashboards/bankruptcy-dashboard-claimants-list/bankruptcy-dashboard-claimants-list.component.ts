import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, ElementRef } from '@angular/core';
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
  selector: 'app-bankruptcy-dashboard-claimants-list',
  templateUrl: './bankruptcy-dashboard-claimants-list.component.html',
  styleUrls: ['./bankruptcy-dashboard-claimants-list.component.scss'],
})
export class BankruptcyDashboardClaimantsListComponent extends DashboardClaimantsListBase<ClaimantDetailsRequest> implements OnInit, OnDestroy {
  @Input() projectId: number;
  @Input() rootProductCategoryId: number;
  @Output() rowDoubleClicked = new EventEmitter();

  public readonly gridId: GridId = GridId.BankruptcyDashboardClaimantsList;

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
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
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
        headerName: 'Overall Status',
        field: 'serviceSummary.bankruptcyOverallStatus',
        minWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Final?',
        field: 'serviceSummary.final',
        cellRenderer: 'checkboxRenderer',
        width: 70,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
      },
      {
        headerName: 'Final Date',
        field: 'serviceSummary.finalDate',
        sortable: true,
        resizable: true,
        cellRenderer: data => this.dateFormat.transform(data.value, false, null, null, null, true),
        cellStyle: { textAlign: 'right' },
        headerClass: 'ag-header-right',
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Abandoned?',
        field: 'serviceSummary.abandoned',
        cellRenderer: 'checkboxRenderer',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        width: 130,
        minWidth: 130,
      },
      {
        headerName: 'CS Needed',
        field: 'serviceSummary.closingStatementNeeded',
        sortable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => this.yesNoPipe.transform(data.value),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'Ready to pay Trustee',
        field: 'serviceSummary.readyToPayTrustee',
        sortable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => this.yesNoPipe.transform(data.value),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'Trustee Amt',
        field: 'serviceSummary.amountToTrustee',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.renderAmount(data),
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
      },
      {
        headerName: 'Attorney Amt',
        field: 'serviceSummary.amountToAttorney',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.renderAmount(data),
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
      },
      {
        headerName: 'Claimant Amt',
        field: 'serviceSummary.amountToClaimant',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.renderAmount(data),
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
      },
      {
        headerName: 'Bankruptcy Fee',
        field: 'serviceSummary.bkFee',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.renderAmount(data),
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
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

  downloadClaimants(params: IServerSideGetRowsParamsExtended, columnsParam: ColumnExport[]): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportClientsByCaseService, this.projectId, this.rootProductCategoryId);
    this.export(channelName, () => {
      this.store$.dispatch(actions.DownloadClaimants({
        channelName,
        agGridParams: params,
        columns: columnsParam,
        rootProductCategoryId: ProductCategory.Bankruptcy,
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
