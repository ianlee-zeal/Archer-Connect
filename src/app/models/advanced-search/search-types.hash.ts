import { SearchType } from './search-type';
import { SearchConditionsEnum } from './search-conditions.enum';
import { FilterTypes } from './filter-types.enum';
import { SearchTypesEnum } from './search-types.enum';

export const SearchTypes: { [key: string]: SearchType } = {
  [SearchTypesEnum.Text]: {
    type: SearchTypesEnum.Text,
    filterType: FilterTypes.Text,
    conditions: [
      SearchConditionsEnum.Equals,
      SearchConditionsEnum.NotEqual,
      SearchConditionsEnum.IsMissing,
      SearchConditionsEnum.Contains,
      SearchConditionsEnum.NotContains,
      SearchConditionsEnum.StartsWith,
      SearchConditionsEnum.EndsWith,
    ],
  },

  [SearchTypesEnum.NumberIdentifier]: {
    type: SearchTypesEnum.NumberIdentifier,
    filterType: FilterTypes.Text,
    conditions: [
      SearchConditionsEnum.Equals,
      SearchConditionsEnum.NotEqual,
      SearchConditionsEnum.Contains,
      SearchConditionsEnum.NotContains,
      SearchConditionsEnum.StartsWith,
      SearchConditionsEnum.EndsWith,
    ],
  },

  [SearchTypesEnum.StringIdentifier]: {
    type: SearchTypesEnum.StringIdentifier,
    filterType: FilterTypes.Text,
    conditions: [
      SearchConditionsEnum.Equals,
      SearchConditionsEnum.NotEqual,
      SearchConditionsEnum.Contains,
      SearchConditionsEnum.NotContains,
      SearchConditionsEnum.StartsWith,
      SearchConditionsEnum.EndsWith,
    ],
  },

  [SearchTypesEnum.Boolean]: {
    type: SearchTypesEnum.Boolean,
    filterType: FilterTypes.Boolean,
  },

  [SearchTypesEnum.TextPrimary]: {
    type: SearchTypesEnum.TextPrimary,
    filterType: FilterTypes.Text,
    conditions: [
      SearchConditionsEnum.Equals,
      SearchConditionsEnum.NotEqual,
      SearchConditionsEnum.IsMissing,
      SearchConditionsEnum.Contains,
      SearchConditionsEnum.NotContains,
      SearchConditionsEnum.StartsWith,
      SearchConditionsEnum.EndsWith,
    ],
  },

  [SearchTypesEnum.Date]: {
    type: SearchTypesEnum.Date,
    filterType: FilterTypes.Date,
    conditions: [
      SearchConditionsEnum.Equals,
      SearchConditionsEnum.NotEqual,
      SearchConditionsEnum.IsMissing,
      SearchConditionsEnum.LessThan,
      SearchConditionsEnum.LessThanOrEqual,
      SearchConditionsEnum.GreaterThan,
      SearchConditionsEnum.GreaterThanOrEqual,
      SearchConditionsEnum.InRange,
    ],
  },

  [SearchTypesEnum.Number]: {
    type: SearchTypesEnum.Number,
    filterType: FilterTypes.Number,
    conditions: [
      SearchConditionsEnum.Equals,
      SearchConditionsEnum.NotEqual,
      SearchConditionsEnum.IsMissing,
      SearchConditionsEnum.LessThan,
      SearchConditionsEnum.LessThanOrEqual,
      SearchConditionsEnum.GreaterThan,
      SearchConditionsEnum.GreaterThanOrEqual,
      SearchConditionsEnum.InRange,
    ],
  },

  [SearchTypesEnum.Key]: {
    type: SearchTypesEnum.Key,
    filterType: FilterTypes.Number,
    conditions: [
      SearchConditionsEnum.Equals,
      SearchConditionsEnum.NotEqual,
      SearchConditionsEnum.IsMissing,
      SearchConditionsEnum.LessThan,
      SearchConditionsEnum.LessThanOrEqual,
      SearchConditionsEnum.GreaterThan,
      SearchConditionsEnum.GreaterThanOrEqual,
    ],
  },

  [SearchTypesEnum.Data]: {
    type: SearchTypesEnum.Data,
    filterType: FilterTypes.Number,
    conditions: [
      SearchConditionsEnum.Equals,
      SearchConditionsEnum.NotEqual,
      SearchConditionsEnum.IsMissing,
      SearchConditionsEnum.Contains,
    ],
  },

  [SearchTypesEnum.DataWithCheckbox]: {
    type: SearchTypesEnum.DataWithCheckbox,
    filterType: FilterTypes.Number,
    conditions: [
      SearchConditionsEnum.Equals,
      SearchConditionsEnum.NotEqual,
      SearchConditionsEnum.IsMissing,
      SearchConditionsEnum.Contains,
    ],
  },

  [SearchTypesEnum.In]: {
    type: SearchTypesEnum.In,
    filterType: FilterTypes.Text,
    conditions: [
      SearchConditionsEnum.Equals,
      SearchConditionsEnum.NotEqual,
      SearchConditionsEnum.IsMissing,
      SearchConditionsEnum.Contains,
    ],
  },

  [SearchTypesEnum.Age]: {
    type: SearchTypesEnum.Age,
    filterType: FilterTypes.Age,
    conditions: [
      SearchConditionsEnum.InRange,
      SearchConditionsEnum.LessThan,
      SearchConditionsEnum.GreaterThan,
    ],
  },

  [SearchTypesEnum.None]: {
    type: SearchTypesEnum.None,
    filterType: FilterTypes.None,
  },
};
