import { CommonHelper } from '@app/helpers/common.helper';
import { FileImportDocumentType } from '@app/models/enums';
import { ColDef } from 'ag-grid-community';
import { FileImportTemplateFields } from './template-base';

export class SpecialPaymentInstructionTemplate extends FileImportTemplateFields {
  ArcherId: number;
  LastName: string;
  FirstName: string;
  ContactFirstname: string;
  ContactLastname: string;
  SplitOfNet: string;

  protected getColumnWidth(key: string): number {
    const { Id } = this;

    let width = super.getColumnWidth(key);
    switch (key) {
      case CommonHelper.nameOf({ Id }):
        width = 90;
        break;
        // no default
    }
    return width;
  }

  getColDef(key: string, documentType: FileImportDocumentType): ColDef {
    const { ArcherId, Id } = this;
    if (documentType === FileImportDocumentType.Preview && key === CommonHelper.nameOf({ ArcherId })) {
      return;
    }
    if (documentType === FileImportDocumentType.LoadingResults && key == CommonHelper.nameOf({ Id })) {
      return;
    }
    return super.getColDef(key, documentType);
  }

  generateColDef(key: string): ColDef {
    const colDef = super.generateColDef(key);
    const { SplitOfNet, Id, ArcherId, ContactFirstname, ContactLastname } = this;
    switch (key) {
      case CommonHelper.nameOf({ ArcherId }):
        colDef.headerName = 'ARCHER ID';
        break;
      case CommonHelper.nameOf({ Id }):
        colDef.headerName = 'ID';
        break;
      case CommonHelper.nameOf({ ContactFirstname }):
        colDef.headerName = 'Contact FirstName';
        break;
      case CommonHelper.nameOf({ ContactLastname }):
        colDef.headerName = 'Contact LastName';
        break;
      case CommonHelper.nameOf({ SplitOfNet }):
        colDef.headerName = 'Split of Net';
        break;
    }
    return colDef;
  }
}
