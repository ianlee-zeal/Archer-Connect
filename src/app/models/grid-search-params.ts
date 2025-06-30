import { FilterModel } from './advanced-search/filter-model';
import { HashTable } from './hash-table';

export class GridSearchParams {
  filters: HashTable<FilterModel>;
}
