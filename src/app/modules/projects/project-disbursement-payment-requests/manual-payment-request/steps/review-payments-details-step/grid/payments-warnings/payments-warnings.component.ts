import { Component, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers';
import { DocumentImport } from '@app/models/documents';
import { FileImportDocumentType, FileImportResultStatus, FileImportReviewTabs, GridId } from '@app/models/enums';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { Store } from '@ngrx/store';
import { GridOptions, ValueGetterParams } from 'ag-grid-community';
import * as fromShared from '@app/modules/shared/state';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';


@Component({
  selector: 'app-payments-warnings',
  templateUrl: './payments-warnings.component.html',
})
export class PaymentsWarningsComponent extends ListView {
  @Input() public documentImport: DocumentImport;
  @Input() public documentTypeId: FileImportDocumentType;

  public gridId: GridId = GridId.FileImportReviewQueued;

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public gridOptions: GridOptions = {
    columnDefs: [
      { ...AGGridHelper.nameColumnDefaultParams, field: 'rowNo', headerName: 'Row Id' },
      {
        ...AGGridHelper.nameColumnDefaultParams,
        //field: 'description',
        headerName: 'Description',
        valueGetter: (params: ValueGetterParams) => {
          const id = params.data.fields.OrganizationId ?? params.data.fields.ClientId;
          const name = !!params.data.fields.OrganizationId
              ? params.data.fields.PayeeOrganization
              : params.data.fields.PayeeName;
          if (!id) {
              return !!name ? name : '';
          }
          return `${id} - ${name}`;
        },
        minWidth: 140,
        width: 140
      },
      { ...AGGridHelper.nameColumnDefaultParams, field: 'property', headerName: 'Data Field' },
      { ...AGGridHelper.nameColumnDefaultParams, field: 'data', headerName: 'Data Value' },
      { ...AGGridHelper.nameColumnDefaultParams, field: 'summary', headerName: 'Summary' },
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

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(fromShared.sharedActions.uploadBulkDocumentActions.GetDocumentImportsResultRequest({
      entityId: this.documentImport.id,
      documentTypeId: this.documentTypeId,
      tab: FileImportReviewTabs.Warnings,
      agGridParams,
      status: FileImportResultStatus.Warn,
    }));
  }
}
