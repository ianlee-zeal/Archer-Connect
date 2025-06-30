import { ISearchOptions } from '../search-options';

export interface IDisbursementGroupUpdateRequestDto {
  caseId: number;
  searchOptions: ISearchOptions;
  disbursementGroupId: number;
}
