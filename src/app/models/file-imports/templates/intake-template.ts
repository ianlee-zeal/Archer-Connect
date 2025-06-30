import { CommonHelper } from '@app/helpers/common.helper';
import { FileImportDocumentType } from '@app/models/enums';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { ColDef } from 'ag-grid-community';
import { FileImportTemplateFields } from './template-base';

export class IntakeTemplate extends FileImportTemplateFields {
  ArcherId: number;
  SSN: string;
  LastName: string;
  FirstName: string;
  DOB: Date;
  DOD: Date;
  Gender: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
  City: string;
  State: string;
  ZipCode: string;
  AttorneyId: number;
  OrgId: number;
  AttorneyReferenceId: string;
  OtherStatesLived: string;

  protected getColumnWidth(key: string): number {
    const { Id, Email, PhoneNumber, State, ZipCode, OrgId, SSN, DOB, DOD, AttorneyReferenceId, OtherStatesLived, City, Address } = this;

    let width = super.getColumnWidth(key);
    switch (key) {
      case CommonHelper.nameOf({ Email }):
        width = 250;
        break;
      case CommonHelper.nameOf({ AttorneyReferenceId }):
      case CommonHelper.nameOf({ OtherStatesLived }):
      case CommonHelper.nameOf({ SSN }):
      case CommonHelper.nameOf({ PhoneNumber }):
        width = 145;
        break;
      case CommonHelper.nameOf({ DOD }):
      case CommonHelper.nameOf({ DOB }):
        width = 120;
        break;
      case CommonHelper.nameOf({ State }):
      case CommonHelper.nameOf({ OrgId }):
        width = 75;
        break;
      case CommonHelper.nameOf({ Id }):
      case CommonHelper.nameOf({ ZipCode }):
        width = 90;
        break;
      case CommonHelper.nameOf({ City }):
      case CommonHelper.nameOf({ Address }):
        width = 230;
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
    const dateFormatPipe: DateFormatPipe = new DateFormatPipe();
    const colDef = super.generateColDef(key);
    const { DOB, DOD, Id, ArcherId } = this;
    switch (key) {
      case CommonHelper.nameOf({ DOB }):
      case CommonHelper.nameOf({ DOD }):
        colDef.cellRenderer = data => dateFormatPipe.transform(data.value, false, null, null, null, true);
        break;
      case CommonHelper.nameOf({ ArcherId }):
        colDef.headerName = 'ARCHER ID';
        break;
      case CommonHelper.nameOf({ Id }):
        colDef.headerName = 'ID';
        break;
        // no default
    }
    return colDef;
  }
}
