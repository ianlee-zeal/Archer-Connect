import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';

import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { ClaimantsWithLedgersListComponent } from '@app/modules/projects/claimants-with-ledgers-list/claimants-with-ledgers-list.component';
import { ClaimantStageRendererComponent } from '@app/modules/projects/project-disbursement-claimant-summary/renderers/stage-render/claimant-stage-renderer.component';

@Component({
  selector: 'app-update-funded-date-selected-list',
  templateUrl: './update-funded-date-selected-list.component.html',
})
export class UpdateFundedDateSelectedList extends ClaimantsWithLedgersListComponent implements OnChanges {

  @Input() projectId: number;
  @Input() updatedTimes: number;
  public batchActionTemplates = BatchActionTemplate;

  public ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.updatedTimes.currentValue > 0 && changes.updatedTimes.currentValue > changes.updatedTimes.previousValue) {
      super.fetchData(this.localGridParams);
    }
  }

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Client ID',
        field: 'clientId',
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
        headerName: 'Funded Date',
        field: 'fundedDate',
        suppressSizeToFit: true,
        minWidth: 250,
        width: 250,
        sortable: true,
        resizable: true,
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
      },
      {
        headerName: 'Primary Firm',
        field: 'primaryFirmName',
        suppressSizeToFit: true,
        minWidth: 250,
        width: 250,
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
        cellRenderer: 'stageRenderer',
        minWidth: 260,
        width: 260,
        suppressSizeToFit: true,
        autoHeight: true,
        wrapText: true,
      },
    ],
    components: { stageRenderer: ClaimantStageRendererComponent },
  };
}
