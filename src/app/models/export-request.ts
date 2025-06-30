import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { ColumnExport } from '.';

export interface IExportRequest {
  name: string;
  columns: ColumnExport[];
  channelName: string;
  searchOptions: IServerSideGetRowsRequestExtended;
}
