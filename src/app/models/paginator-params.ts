import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

export class PaginatorParams {
  gridParams: IServerSideGetRowsRequestExtended;
  otherParams?: any[];
}
