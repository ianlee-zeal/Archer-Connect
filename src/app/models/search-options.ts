import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

export interface ISearchOptions extends IServerSideGetRowsRequestExtended {
  isSelectAll: boolean;
  containIds: number[];
  notContainIds: number[];
}
