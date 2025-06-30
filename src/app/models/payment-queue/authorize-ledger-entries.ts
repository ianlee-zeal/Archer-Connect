import { IServerSideGetRowsRequest } from 'ag-grid-community';

export interface IAuthorizeLedgerEntries {
  searchOptions?: Partial<IServerSideGetRowsRequest>;
  ledgerEntryIds: number[];
  paymentInstructionIds: number[];
}
