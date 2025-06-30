import { Component, Input } from '@angular/core';

import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { ClaimantsWithLedgersListComponent } from '../../claimants-with-ledgers-list/claimants-with-ledgers-list.component';
import { ClaimantStageRendererComponent } from '../../project-disbursement-claimant-summary/renderers/stage-render/claimant-stage-renderer.component';

@Component({
  selector: 'app-update-by-action-template-id-ledgers-list',
  templateUrl: './update-by-action-template-id-ledgers-list.component.html',
})
export class UpdateByActionTemplateIdLedgersListComponent extends ClaimantsWithLedgersListComponent {
  @Input() actionTemplateId: number;
  public batchActionTemplates = BatchActionTemplate;

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
        headerName: 'Group Name',
        field: 'disbursementGroupName',
        suppressSizeToFit: true,
        minWidth: 250,
        width: 250,
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
