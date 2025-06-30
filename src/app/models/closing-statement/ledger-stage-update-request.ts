import { ISearchOptions } from '../search-options';

export interface ILedgerStageUpdateRequestDto {
  caseId: number;
  searchOptions: ISearchOptions;
  stageId: number;
}
