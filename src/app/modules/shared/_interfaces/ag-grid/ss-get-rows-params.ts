import { IServerSideGetRowsParams } from 'ag-grid-community';
import { IServerSideGetRowsRequestExtended } from './ss-get-rows-request';

export interface IServerSideGetRowsParamsExtended extends IServerSideGetRowsParams {
  request: IServerSideGetRowsRequestExtended;
}
