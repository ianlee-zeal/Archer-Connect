import { Component, ElementRef, Input } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { AuditorState } from '@app/modules/auditor/state/reducer';

import { FileImportReviewTabs } from '@app/models/enums';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridId } from '@app/models/enums/grid-id.enum';

import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { SearchConditionsEnum } from '@app/models/advanced-search/search-conditions.enum';

import { CurrencyHelper } from '@app/helpers';
import * as auditBatchModalActions from '../../../state/actions';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-upload-audit-data-all-records-list',
  templateUrl: './upload-audit-data-all-records-list.component.html',
})
export class UploadAuditDataAllRecordsListComponent extends ListView {
  @Input() public auditRunId: number;

  public gridId: GridId = GridId.AuditBatchReviewAllRecords;

  constructor(
    private store: Store<AuditorState>,
    protected router: Router,
    protected elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      suppressMenu: true,
      autoHeight: true,
      wrapText: true,
      sortable: false,
    },
    columnDefs: [
      { field: 'lienId', headerName: 'Lien ID', width: 150 },
      { field: 'clientName', headerName: 'Claimant Name', width: 150 },
      { field: 'lienHolderName', headerName: 'Lien Holder', width: 150 },
      { field: 'totalLienAmount', headerName: 'Total Lien Amount', width: 120, cellRenderer: CurrencyHelper.toUsdFormat },
      { field: 'lienAmount', headerName: 'Audited Lien Amount', width: 120, cellRenderer: CurrencyHelper.toUsdFormat },
      { field: 'status.name', headerName: 'Summary', width: 120 },
    ],
  };

  public ngOnInit() {
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.addAuditRunIdFilterIntoSearchParams(this.auditRunId, agGridParams);

    this.store.dispatch(auditBatchModalActions.GetAuditValidationResults({
      tab: FileImportReviewTabs.AllRecords,
      agGridParams,
    }));
  }

  private addAuditRunIdFilterIntoSearchParams(auditRunId: number, params: IServerSideGetRowsParamsExtended): void {
    params.request.filterModel.push(new FilterModel({
      filter: auditRunId,
      filterType: FilterTypes.Number,
      key: 'auditRunId',
      type: SearchConditionsEnum.Equals,
    }));
  }
}
