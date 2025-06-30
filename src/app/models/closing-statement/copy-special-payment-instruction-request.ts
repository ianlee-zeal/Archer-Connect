import { ISearchOptions } from '../search-options';

export interface ICopySpecialPaymentInstructionRequest {
  searchOptions: ISearchOptions;
  ledgerEntryId: number;
}
