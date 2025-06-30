import { CommonHelper } from '@app/helpers/common.helper';
import { DocumentImport } from '@app/models/documents';
import { FileImportReviewTabs } from '@app/models/enums';
import { ColDef } from 'ag-grid-community';
import { FileImportTab } from '..';
import { FileImportTemplateFields } from './template-base';

export class DisbursementGroupTemplate extends FileImportTemplateFields {
  ArcherId: number;
  LastName: string;
  FirstName: string;
  Amount: number;
  TotalAllocation: boolean;
  LienStatus: string;
  FinalLienAmount: number;
  GroupId: number;
  GroupName: string;

  generateColDef(key: string): ColDef {
    const colDef = super.generateColDef(key);
    const { Id, ArcherId } = this;
    switch (key) {
      case CommonHelper.nameOf({ Id }):
        colDef.headerName = 'ID';
        break;
      case CommonHelper.nameOf({ ArcherId }):
        colDef.headerName = 'ARCHER ID';
        break;
          // no default
    }
    return colDef;
  }

  public static generateResultTabsGroup(documentImport: DocumentImport): FileImportTab[] {
    return [
      {
        tab: FileImportReviewTabs.AllRecords,
        title: 'All Records',
        count: documentImport.countTotal,
      },
      {
        tab: FileImportReviewTabs.Errors,
        title: 'Errors',
        count: documentImport.countErrored,
      },
      {
        tab: FileImportReviewTabs.Warnings,
        title: 'Warnings',
        count: documentImport.countWarned,
      },
    ];
  }
}
