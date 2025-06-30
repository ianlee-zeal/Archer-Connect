import { IServerSideGetRowsRequest } from 'ag-grid-community';

export interface ICreateTransferRequest {
  searchOptions?: Partial<IServerSideGetRowsRequest>;
  paymentTypes: number[];
  paymentFirms: number[];
}
