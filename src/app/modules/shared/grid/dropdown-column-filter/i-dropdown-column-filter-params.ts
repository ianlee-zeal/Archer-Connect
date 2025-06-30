import { Observable } from 'rxjs';
import { SelectOption } from '../../_abstractions/base-select';

export interface IDropdownColumnFilterParams {
  options?: SelectOption[];
  filterByName?: boolean;
  defaultValue?: number;
  searchable?: boolean;
  callback?: Function;
  asyncOptions?: Observable<SelectOption[]>;
}
