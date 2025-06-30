import { ISearchOptions } from "../search-options";

export interface IUpdateFundedDateRequest {
  searchOptions: ISearchOptions;
  fundedDate: Date;
}