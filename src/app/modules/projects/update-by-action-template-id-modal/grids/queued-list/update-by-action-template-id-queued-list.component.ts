import { Component, ElementRef, Input, OnInit } from '@angular/core';

import { ColDef, GridOptions } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { FileImportReviewTabs } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromShared from '@app/modules/shared/state';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { ClaimantSummaryStatusEnum } from '@app/models/enums/claimant-summary-status.enum';
import { CurrencyHelper } from '@app/helpers';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import * as projectActions from '../../../state/actions';

@Component({
  selector: 'app-update-by-action-template-id-queued-list',
  templateUrl: './update-by-action-template-id-queued-list.component.html',
})
export class UpdateByActionTemplateIdQueuedListComponent extends ListView implements OnInit {
  @Input() public batchAction: BatchAction;
  @Input() public actionTemplateId: number;
  @Input() public documentTypeId: BatchActionDocumentType;
  public gridId: GridId = GridId.FileImportReviewQueued;
  public gridOptions: GridOptions;
  public additionalColDefs: ColDef[] = [];

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef : ElementRef,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.initGridOptions();
  }

  public initGridOptions() {
    if (this.actionTemplateId === BatchActionTemplate.UpdateLedgerLienData) {
      this.additionalColDefs = [
        { ...AGGridHelper.nameColumnDefaultParams, field: 'fields.LienStatusFinalized', headerName: 'Lien Status', cellRenderer: data => (data.value ? ClaimantSummaryStatusEnum.Finalized : ClaimantSummaryStatusEnum.Pending) },
        { field: 'fields.LienTotalAmount', headerName: 'Lien Total', minWidth: 120, width: 120, cellRenderer: CurrencyHelper.toUsdFormat },
      ];
    }

    this.gridOptions = {
      columnDefs: [
        { ...AGGridHelper.nameColumnDefaultParams, field: 'fields.ClientId', headerName: 'Client ID', minWidth: 140, width: 140 },
        { ...AGGridHelper.nameColumnDefaultParams, field: 'fields.FirstName', headerName: 'First Name' },
        { ...AGGridHelper.nameColumnDefaultParams, field: 'fields.LastName', headerName: 'Last Name' },
        { ...AGGridHelper.nameColumnDefaultParams, field: 'fields.GroupName', headerName: 'Group Name' },
        ...this.additionalColDefs,
      ],
      animateRows: false,
      defaultColDef: {
        suppressMenu: true,
        autoHeight: true,
        wrapText: true,
        minWidth: 240,
        width: 240,
        sortable: false,
      },
    };
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(projectActions.GetBatchActionResultRequest({
      entityId: this.batchAction.id,
      documentTypeId: this.documentTypeId,
      tab: FileImportReviewTabs.Queued,
      agGridParams,
      status: BatchActionResultStatus.Enqueued,
    }));
  }
}
