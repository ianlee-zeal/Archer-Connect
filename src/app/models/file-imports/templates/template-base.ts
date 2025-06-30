import { CommonHelper } from '@app/helpers/common.helper';
import { DocumentImport } from '@app/models/documents';
import { FileImportDocumentType, FileImportReviewTabs } from '@app/models/enums';
import { SplitCamelCasePipe } from '@app/modules/shared/_pipes/split-camel-case.pipe';
import { ColDef } from 'ag-grid-community';
import { FileImportTab } from '..';

export class FileImportTemplateFields {
  Id: number;

  static readonly DefaultColumnWidth = 100;

  constructor(fields?: any) {
    Object.assign(this, fields);
  }

  getColDefRows(documentType: FileImportDocumentType): ColDef[] {
    const { Id } = this;
    const colDefs: ColDef[] = [];
    const props = Object.keys(this).sort((x, y) => {
      if (x === CommonHelper.nameOf({ Id }) || y === CommonHelper.nameOf({ Id })) {
        return -1;
      }
      return 0;
    });
    props.forEach((key: string) => {
      const colDef = this.getColDef(key, documentType);
      if (!colDef) {
        return;
      }
      colDefs.push(colDef);
    });
    return colDefs;
  }

  protected getColDef(key: string, documentType: FileImportDocumentType): ColDef {
    const { Id } = this;
    const skipGenerationColDef = documentType === FileImportDocumentType.Preview && key === CommonHelper.nameOf({ Id });
    if (!skipGenerationColDef) {
      return this.generateColDef(key);
    }
    return null;
  }

  protected getColumnWidth(key: string): number { /* eslint-disable-line @typescript-eslint/no-unused-vars */
    return FileImportTemplateFields.DefaultColumnWidth;
  }

  protected generateColDef(key: string): ColDef {
    const splitCamelCasePipe: SplitCamelCasePipe = new SplitCamelCasePipe();
    return {
      field: `fields.${key}`,
      headerName: splitCamelCasePipe.transform(key),
      width: this.getColumnWidth(key),
      minWidth: this.getColumnWidth(key),
    } as ColDef;
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
    ];
  }
}
