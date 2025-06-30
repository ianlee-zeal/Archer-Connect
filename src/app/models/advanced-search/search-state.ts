import lowerFirst from 'lodash/lowerFirst';

import { StringHelper } from '@app/helpers/string.helper';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { SearchField } from './search-field';
import { SearchConditionsEnum } from './search-conditions.enum';
import { SearchTypes } from './search-types.hash';
import { FilterModel } from './filter-model';
import { HashTable } from '../hash-table';
import { FilterTypes } from './filter-types.enum';
import { SearchGroupType } from '../enums/search-group-type.enum';
import { AdvancedSearchFieldDataWithCheckboxKeys } from '../enums/advanced-search-data-chekbox-keys.enum';

export class SearchState {
  field: SearchField = null;
  condition: SearchConditionsEnum = null;
  term?: string | boolean | Date | number = null;
  termTo?: string | Date = null;
  errors?: HashTable<string | {}> = {};
  additionalFields?: SearchState[];
  additionalInfo: HashTable<string | number | boolean> = {};
  isAllOptionsSelected: boolean = false;
  // the property should be removed but it requires refactoring of product workflow component
  options: SelectOption[];

  static getFilterModel(state: SearchState): FilterModel[] {
    if (!state || this.hasError(state)) {
      return [];
    }

    const models: FilterModel[] = [];

    if (state.field && state.field.type.filterType) {
      if (state.additionalFields && state.additionalFields.length) {
        const additionalFieldsModel: FilterModel[] = [];
        const conditionsModel: FilterModel[] = [];

        const filteredAdditionalFields = state.additionalFields.filter(o => o.condition != null && o.term && o.term !== -1);
        filteredAdditionalFields.forEach(o => {
          additionalFieldsModel.push(SearchState.toFilterModel(o));
          if (this.isAdditionalCheckboxChecked(state, o)) {
            additionalFieldsModel.push(this.getAdditionalFilterModel(o));
          }
        });

        const rootKey = state.field.key;
        if (rootKey.length > 0) {
          // If additional fields are nested, they will have a root key defined on the field property
          conditionsModel[0] = new FilterModel();
          conditionsModel[0].key = rootKey;
          conditionsModel[0].conditions = additionalFieldsModel;
        } else {
          // If additional fields are not nested, they will not have a root key defined on the field property
          additionalFieldsModel.forEach(o => {
            conditionsModel.push(o);
          });
        }

        if (state.field.primaryKey && state.term) {
          additionalFieldsModel.push(SearchState.toFilterModel(state, state.field.primaryKey));
        }

        conditionsModel.forEach(obj => models.push(obj));
      } else {
        if (state.additionalInfo && state.additionalInfo.isChecboxChecked) {
          models.push(new FilterModel({
            key: AdvancedSearchFieldDataWithCheckboxKeys[state.field.key],
            filterType: FilterTypes.Boolean,
            filter: 'true',
            filterTo: <string>state.termTo,
            type: SearchState.getTypeByCondition(SearchConditionsEnum.Equals),
          }));
        }
        const key: string = state.additionalInfo?.isPrimary ? state.field.primaryKey : state.field.key;
        models.push(SearchState.toFilterModel(state, key));
      }
    }

    return models;
  }

  private static toFilterModel(entry: SearchState, key?: string): FilterModel {
    // base filter model, same for all types
    const datePipe: DateFormatPipe = new DateFormatPipe();
    const filterModel: FilterModel = new FilterModel();

    filterModel.key = key != null ? key : entry.field.key;
    filterModel.filterType = entry.field.type.filterType;
    filterModel.type = SearchState.getTypeByCondition(entry.condition);

    if (entry.condition === SearchConditionsEnum.IsMissing) {
      filterModel.filterType = FilterTypes.Exists;
      filterModel.type = SearchState.getTypeByCondition(SearchConditionsEnum.NotEqual);
    } else {
      // custom conversion of our search types to search blob models
      switch (entry.field.type.type) {
        case SearchTypes.numberIdentifier.type:
          if (entry.additionalInfo?.commaSeparatedIds) {
            let value = entry.term as string;
            if (value?.startsWith(',')) {
              value = value?.slice(1);
              entry.term = value;
            }
            if (value?.endsWith(',')) {
              entry.term = value?.slice(0, -1);
            }
          }
          filterModel.filterType = entry.additionalInfo.commaSeparatedIds ? FilterTypes.Number : FilterTypes.Text;
          filterModel.filter = <string>entry.term;
          filterModel.filterTo = <string>entry.termTo;
          break;
        case SearchTypes.stringIdentifier.type:
          if (entry.additionalInfo?.commaSeparatedIds) {
            let value = entry.term as string;
            if (value?.startsWith(',')) {
              value = value?.slice(1);
              entry.term = value;
            }
            if (value?.endsWith(',')) {
              entry.term = value?.slice(0, -1);
            }
          }
          filterModel.filterType = FilterTypes.Text;
          filterModel.filter = (entry.field.trimTerm ? entry.field.trimTerm(entry.term) : entry.term)?.trim();
          filterModel.filterTo = (entry.field.trimTerm ? entry.field.trimTerm(entry.termTo) : entry.termTo)?.trim();
          break;
        case SearchTypes.text.type: {
          const term = entry.field.trimTerm ? entry.field.trimTerm(entry.term) : entry.term;
          const termTo = entry.field.trimTerm ? entry.field.trimTerm(entry.termTo) : entry.termTo;

          filterModel.filter = (term as string)?.trim();
          filterModel.filterTo = (termTo as string)?.trim();
          break;
        }
        case SearchTypes.boolean.type:
          filterModel.filter = <string>entry.term;
          filterModel.filterTo = <string>entry.termTo;
          filterModel.type = SearchState.getTypeByCondition(SearchConditionsEnum.Equals);
          break;

        case SearchTypes.textPrimary.type: {
          const term = entry.field.trimTerm ? entry.field.trimTerm(entry.term) : entry.term;
          const termTo = entry.field.trimTerm ? entry.field.trimTerm(entry.termTo) : entry.termTo;

          filterModel.filter = (term as string)?.trim();
          filterModel.filterTo = (termTo as string)?.trim();
          break;
        }

        case SearchTypes.number.type:
          const filter = (entry.term as string)?.split(',').join('');
          const filterTo = (entry.termTo as string)?.split(',').join('');
          filterModel.filter = +filter;
          filterModel.filterTo = +filterTo;
          break;

        case SearchTypes.date.type:
          filterModel.dateFrom = datePipe.transform(<Date>entry.term, false, 'yyyy-MM-dd', null, entry.field.noUtc, true);
          filterModel.dateTo = entry.termTo
            ? datePipe.transform(entry.termTo, false, 'yyyy-MM-dd', null, entry.field.noUtc, true)
            : null;
          break;

        case SearchTypes.data.type:
        case SearchTypes.dataWithCheckbox.type:
          filterModel.filter = <string | number>entry.term;
          filterModel.filterType = isNaN(+entry.term) && !StringHelper.containsComma(<string>entry.term) ? FilterTypes.Text : FilterTypes.Number;
          break;

        case SearchTypes.in.type:
          filterModel.filter = <string | number>entry.term;
          filterModel.filterType = FilterTypes.Text;
          filterModel.type = SearchTypes.in.type;
          break;

        case SearchTypes.age.type:
          filterModel.filter = <string>entry.term;
          const termTo = <string>entry.termTo;
          if (termTo) {
            filterModel.filterTo = termTo;
          }
          filterModel.type += entry.additionalInfo.period;
          break;
        case SearchTypes.none.type:
          break;
        default:
          filterModel.filter = (entry.term as string)?.trim();
          filterModel.filterTo = (entry.termTo as string)?.trim();
      }
    }

    return filterModel;
  }

  static filterModelFromParam(item: any): FilterModel {
    const key = item[0];
    const filter = item[1];
    return {
      type: filter.type,
      filter: filter.filter,
      filterType: filter.filterType,
      conditions: [],
      dateFrom: filter.dateFrom,
      dateTo: filter.dateTo,
      filterTo: filter.filterTo,
      key,
    };
  }

  // this is a reverse lookup on SearchConditionsEnum, we need the enum key (case sensitive) for filterModel
  public static getTypeByCondition(condition: SearchConditionsEnum): string {
    const foundCondition = Object.keys(SearchConditionsEnum)
      .filter(x => SearchConditionsEnum[x] == condition)
      .pop();

    if (!foundCondition) {
      return null;
    }

    return lowerFirst(foundCondition);
  }

  public static toDto(item: SearchState): any {
    return {
      field: { ...item.field, options: null },
      condition: item.condition,
      additionalFields: item.additionalFields,
      term: item.term,
      termTo: item.termTo,
      errors: item.errors,
      additionalInfo: item.additionalInfo,
    };
  }

  public static hasErrors(state: SearchState[]): boolean {
    return state.some(entry => {
      if (entry.additionalFields && entry.additionalFields.length) {
        return entry.additionalFields.some(additionalEntry => Object.keys(additionalEntry.errors).length !== 0 || !additionalEntry.field);
      }
      return Object.keys(entry.errors).length !== 0 || !entry.field;
    });
  }

  private static hasError(state: SearchState): boolean {
    if (state.additionalFields && state.additionalFields.length) {
      return state.additionalFields.some(additionalEntry => Object.keys(additionalEntry.errors).length !== 0 || !additionalEntry.field);
    }

    return Object.keys(state.errors).length !== 0 || !state.field;
  }

  private static isAdditionalCheckboxChecked(state: SearchState, o: SearchState): boolean {
    if (!o.additionalInfo?.isChecboxChecked || !AdvancedSearchFieldDataWithCheckboxKeys[o.field.key]) {
      return false;
    }
    switch (state.field.groupType) {
      case SearchGroupType.ClientWorkflowGroup:
        return true;
      default:
        return false;
    }
  }

  private static getAdditionalFilterModel(o: SearchState): FilterModel {
    return SearchState.toFilterModel(o, AdvancedSearchFieldDataWithCheckboxKeys[o.field.key]);
  }
}
