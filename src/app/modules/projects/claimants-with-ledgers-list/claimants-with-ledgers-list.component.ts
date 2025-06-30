import { Component, ElementRef, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';

import { first } from 'rxjs/operators';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { GridId } from '@app/models/enums/grid-id.enum';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { SearchOptionsHelper } from '@app/helpers';
import { PusherService } from '@app/services/pusher.service';
import { IGridLocalData } from '@app/state/root.state';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import * as projectActions from '../state/actions';
import * as claimantSummarySelectors from '../project-disbursement-claimant-summary/state/selectors';
import { ProjectsCommonState } from '../state/reducer';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-claimants-with-ledgers-list',
  templateUrl: './claimants-with-ledgers-list.component.html',
})
export class ClaimantsWithLedgersListComponent extends ListView {
  @Input() projectId: number;

  public readonly gridId: GridId = GridId.ClaimantsWithLedgers;

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'ARCHER ID',
        field: 'archerId',
        width: 50,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
      },
      {
        headerName: 'First Name',
        field: 'clientFirstName',
        colId: 'firstName',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Last Name',
        field: 'clientLastName',
        colId: 'lastName',
        suppressSizeToFit: true,
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Primary Firm',
        field: 'primaryFirmName',
        colId: 'primaryFirm',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Disbursement Group ID',
        field: 'disbursementGroupSequence',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        minWidth: 180,
        width: 180,
      },
      {
        headerName: 'Disbursement Group Type',
        field: 'disbursementGroupTypeName',
        suppressSizeToFit: true,
        minWidth: 180,
        width: 180,
      },
      {
        headerName: 'Ledger Stage',
        field: 'ledgerStageName',
        colId: 'stage.name',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
    ],
  };

  private clientSummaryGridParams: IServerSideGetRowsParamsExtended;
  private clientSummaryGridLocalData: IGridLocalData;
  protected localGridParams: IServerSideGetRowsParamsExtended;

  constructor(
    public modal: BsModalRef,
    public store: Store<ProjectsCommonState>,
    public router: Router,
    public datePipe: DateFormatPipe,
    public elRef: ElementRef<any>,
    public actionsSubj: ActionsSubject,
    public pusher: PusherService,
  ) {
    super(router, elRef);
  }

  public ngOnInit(): void {
    this.subscribeToClientSummaryGridParams();
    this.subscribeToClientSummaryGridLocalData();
  }

  protected fetchData(gridParams: IServerSideGetRowsParamsExtended): void {
    this.localGridParams = gridParams;
    const searchOpts = SearchOptionsHelper.createSearchOptions(this.clientSummaryGridLocalData, this.clientSummaryGridParams);
    searchOpts.startRow = gridParams.request.startRow;
    searchOpts.endRow = gridParams.request.endRow;
    searchOpts.sortModel = gridParams.request.sortModel;
    searchOpts.filterModel = [
      ...searchOpts.filterModel,
      new FilterModel({ filter: 0, filterType: FilterTypes.Number, type: 'greaterThan', key: 'claimSettlementLedgerId' }),
      new FilterModel({ filter: true, filterType: FilterTypes.Boolean, type: 'equals', key: 'disbursementGroupActive' }),
    ];

    this.store.dispatch(projectActions.GetClaimantsWithLedgersList({ gridParams, projectId: this.projectId, searchOpts }));
  }

  private subscribeToClientSummaryGridParams(): void {
    this.store.select(claimantSummarySelectors.gridParams)
      .pipe(first())
      .subscribe(params => {
        this.clientSummaryGridParams = params;
      });
  }

  private subscribeToClientSummaryGridLocalData(): void {
    this.store.select(rootSelectors.gridLocalDataByGridId({ gridId: GridId.ClaimantSummaryList }))
      .pipe(first())
      .subscribe(data => {
        this.clientSummaryGridLocalData = data;
      });
  }

  public ngOnDestroy(): void {
    this.store.dispatch(rootActions.ClearGridLocalData({ gridId: GridId.ClaimantsWithLedgers }));
    super.ngOnDestroy();
  }
}
