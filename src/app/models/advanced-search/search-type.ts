import { SearchConditionsEnum } from './search-conditions.enum';
import { SearchTypesEnum } from './search-types.enum';

export class SearchType {
  type: SearchTypesEnum;
  filterType: string;
  conditions?: SearchConditionsEnum[];
}
