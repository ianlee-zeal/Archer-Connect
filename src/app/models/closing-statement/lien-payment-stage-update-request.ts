import { ISearchOptions } from '../search-options';

export interface ILienPaymentStageUpdateRequestDto {
  searchOptions: ISearchOptions;
  stageId: number;
}
