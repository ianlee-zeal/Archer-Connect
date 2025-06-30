import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { ISearchOptions } from './search-options';

export interface LedgerSearchRequest {
  projectId: number;
  claimantsSearchOpt: ISearchOptions;
  ledgersSearchOpt: IServerSideGetRowsRequestExtended;
}
