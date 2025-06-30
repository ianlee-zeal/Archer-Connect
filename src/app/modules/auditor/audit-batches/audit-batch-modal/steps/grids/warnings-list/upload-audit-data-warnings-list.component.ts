import { Component, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { AuditorState } from '@app/modules/auditor/state/reducer';
import { GridOptions } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { AuditBatchUploading, FileImportReviewTabs } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';

import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { SearchConditionsEnum } from '@app/models/advanced-search/search-conditions.enum';

import { AuditDataValidationFieldEntityType } from '@app/models/enums/audit-data-validation-field-type.enum';
import * as auditBatchModalActions from '../../../state/actions';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-upload-audit-data-warnings-list',
  templateUrl: './upload-audit-data-warnings-list.component.html',
})
export class UploadAuditDataWarningsListComponent extends ListView {
  @Input() public auditRunId: number;

  public gridId: GridId = GridId.AuditBatchReviewWarnings;

  constructor(
    private store: Store<AuditorState>,
    protected router: Router,
    protected elementRef : ElementRef,
  ) {
    super(router, elementRef);
  }

  public gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      suppressMenu: true,
      autoHeight: true,
      wrapText: true,
      minWidth: 240,
      width: 240,
      sortable: false,
    },
    columnDefs: [
      { field: 'lienId', headerName: 'Lien ID', width: 150 },
      {
        field: 'auditValidationResult.field',
        headerName: 'Entity Type',
        cellRenderer: ({ value }) => AuditDataValidationFieldEntityType[value],
      },
      { field: 'auditValidationResult.fieldValue', headerName: 'Data Field', width: 150 },
      { field: 'auditValidationResult.value', headerName: 'Data Value', width: 150 },
      { field: 'auditValidationResult.summary', headerName: 'Summary', width: 200 },
    ],
  };

  public ngOnInit():void {
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.addAuditRunIdFilterIntoSearchParams(this.auditRunId, agGridParams);
    this.addDataValidationResultIdFilterIntoSearchParams(agGridParams);

    this.store.dispatch(auditBatchModalActions.GetAuditValidationResults({
      tab: FileImportReviewTabs.Warnings,
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

  private addDataValidationResultIdFilterIntoSearchParams(params: IServerSideGetRowsParamsExtended): void {
    params.request.filterModel.push(new FilterModel({
      filter: AuditBatchUploading.Warning,
      filterType: FilterTypes.Number,
      key: 'previewStatusId',
      type: SearchConditionsEnum.Equals,
    }));
  }
}
