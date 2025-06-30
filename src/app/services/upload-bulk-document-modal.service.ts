import { Injectable } from '@angular/core';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ColDef, ICellRendererParams } from 'ag-grid-community';

@Injectable({ providedIn: 'root' })
export class UploadBulkDocumentModalService {
  public addClaimantNameColumnIntoColDefs(colDefs: ColDef[]): ColDef[] {
    const claimantNameColDef: ColDef = {
      ...AGGridHelper.nameColumnDefaultParams,
      field: 'fields',
      headerName: 'Claimant Name',
      cellRenderer: (params: ICellRendererParams) => `${params.value?.FirstName} ${params.value?.LastName}`,
    };

    const descriptionColumnIndex = colDefs.findIndex((c: ColDef) => c.field === 'description');

    if (descriptionColumnIndex !== -1) {
      colDefs.splice(descriptionColumnIndex + 1, 0, claimantNameColDef);
    } else {
      colDefs.push(claimantNameColDef);
    }

    return [...colDefs];
  }

  public addRowNoColumnIntoColDefs(colDefs: ColDef[]): ColDef[] {
    const rowNoColDef = { field: 'rowNo', headerName: 'Row Id', width: 50, maxWidth: 60 };

    return [
      rowNoColDef,
      ...colDefs,
    ];
  }
}
