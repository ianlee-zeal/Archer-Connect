import { ElementRef, Input, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { ColDef, GridOptions } from 'ag-grid-community';
import { filter, takeUntil } from 'rxjs/operators';

import { FileImportDocumentType, FileImportTemplateTypes } from '@app/models/enums';
import { ValidationResultsLineItem } from '@app/models/file-imports';
import { LedgerTemplate, IntakeTemplate, FileImportTemplateFields } from '@app/models/file-imports/templates';
import * as fromShared from '@app/modules/shared/state';

import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DocumentImport } from '@app/models/documents';
import { DisbursementGroupTemplate } from '@app/models/file-imports/templates/disbursement-group-template';
import { SpecialPaymentInstructionTemplate } from '@app/models/file-imports/templates/special-payment-instruction-template';

@Directive()
export abstract class FileImportTemplateGrid extends ListView {
  @Input() public documentImport: DocumentImport;
  @Input() public documentTypeId: FileImportDocumentType;

  public allRecords$ = this.store.select(fromShared.sharedSelectors.uploadBulkDocumentSelectors.allRecords);

  constructor(
    protected store: Store<fromShared.AppState>,
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
    rowClassRules: {
      'warning-row': 'data && data.errorList.length',
      'success-row': 'data && !data.errorList.length',
    },
  };

  ngOnInit(): void {
    this.allRecords$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => {
      const rowItem = result.rows.find(item => !!item.fields);
      this.gridOptions = {
        ...this.gridOptions,
        columnDefs: this.getColumnDefs(rowItem),
      };
    });
  }

  private getColumnDefs(item: ValidationResultsLineItem): ColDef[] {
    if (!item) {
      return null;
    }
    const { ArcherId, FirstName, LastName, Amount } = item.fields;

    switch (this.documentImport.templateId) {
      case FileImportTemplateTypes.Intake:
        return new IntakeTemplate(item.fields).getColDefRows(this.documentTypeId);
      case FileImportTemplateTypes.SpecialPaymentInstructions:
        return new SpecialPaymentInstructionTemplate(item.fields).getColDefRows(this.documentTypeId);
      case FileImportTemplateTypes.CondensedDisbursementWorksheet:
      case FileImportTemplateTypes.DetailedDisbursementWorksheet:
      case FileImportTemplateTypes.LedgerLienDataFees:
      case FileImportTemplateTypes.LedgerArcherFees:
      case FileImportTemplateTypes.GrossAllocation:
      case FileImportTemplateTypes.GTFMDW:
        return new LedgerTemplate(item.fields).getColDefRows(this.documentTypeId);
      case FileImportTemplateTypes.DisbursementGroups:
        return new DisbursementGroupTemplate({ ArcherId, FirstName, LastName, Amount }).getColDefRows(this.documentTypeId);
      default:
        return new FileImportTemplateFields(item.fields).getColDefRows(this.documentTypeId);
    }
  }
}
