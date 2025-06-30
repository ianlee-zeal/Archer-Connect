import { ColDef } from 'ag-grid-community';

import { CommonHelper } from '@app/helpers/common.helper';
import { DocumentImport } from '@app/models/documents';
import { FileImportDocumentType, FileImportReviewTabs } from '@app/models/enums';
import { FileImportTab } from '..';
import { FileImportTemplateFields } from './template-base';

export class LedgerTemplate extends FileImportTemplateFields {
  ArcherId: number;
  LastName: string;
  FirstName: string;

  getColDef(key: string, documentType: FileImportDocumentType): ColDef {
    const { Id } = this;
    if (documentType === FileImportDocumentType.LoadingResults && key === CommonHelper.nameOf({ Id })) {
      return;
    }
    // eslint-disable-next-line consistent-return
    return super.getColDef(key, documentType);
  }

  public static generateResultTabsGroup(documentImport: DocumentImport): FileImportTab[] {
    return [
      {
        tab: FileImportReviewTabs.AllRecords,
        title: 'All Records',
        count: documentImport.countTotal,
      },
      {
        tab: FileImportReviewTabs.Inserts,
        title: 'Inserts',
        count: documentImport.countInserted,
      },
      {
        tab: FileImportReviewTabs.Updates,
        title: 'Updates',
        count: documentImport.countUpdated,
      },
      {
        tab: FileImportReviewTabs.NoUpdates,
        title: 'No Updates',
        count: documentImport.countNotUpdated,
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
      {
        tab: FileImportReviewTabs.Deleted,
        title: 'Deleted',
        count: documentImport.countDeleted,
      },
    ];
  }

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
}
