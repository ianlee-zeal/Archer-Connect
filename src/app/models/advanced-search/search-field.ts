import { Observable } from 'rxjs';

import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { SearchConditionsEnum } from '@app/models/advanced-search/search-conditions.enum';
import { SearchGroupType } from '@app/models/enums';
import { SearchType } from './search-type';
import { SearchTypes } from './search-types.hash';

export class SearchField {
  key: string;
  name: string;
  type: SearchType;
  groupType?: SearchGroupType;
  additionalFieldKeys?: SearchField[];
  allAdditionalFieldsRequired?: boolean;
  defaultCondition?: SearchConditionsEnum;
  defaultTerm?: string | number | boolean;
  keyCondition?: string;
  primaryKey?: string;
  primaryLabel?: string;
  validation?: Function;
  conditionsForValidation?: SearchConditionsEnum[];
  exceptConditions?: SearchConditionsEnum[];
  endpoint?: string;
  options?: Observable<SelectOption[]> | SelectOption[];
  optionId?: string;
  optionValue?: string;
  onTermChange?: (value: any) => void;
  onConditionChange?: (value: string) => void;
  noUtc?: boolean;
  placeholder?: boolean = true;
  trimTerm?: Function;
  permissions?: string[];
  termsToShowCheckbox?: string[] | number[];
  checkboxLabel?: string;
  checkboxHidden?: boolean;
  mutualExclusion?: boolean;
  tooltipText?: string;

  public static text(
    key: string,
    name: string,
    validation?: Function,
    defaultCondition?: SearchConditionsEnum,
    exceptConditions?: SearchConditionsEnum[],
    conditionsForValidation?: SearchConditionsEnum[],
    trimTerm?: Function,
    permissions?: string[],
  ): SearchField {
    return {
      key,
      name,
      validation,
      defaultCondition,
      exceptConditions,
      conditionsForValidation,
      trimTerm,
      type: SearchTypes.text,
      permissions,
    };
  }

  public static numberIdentifier(
    key: string,
    name: string,
    validation?: Function,
    defaultCondition?: SearchConditionsEnum,
    exceptConditions?: SearchConditionsEnum[],
    conditionsForValidation?: SearchConditionsEnum[],
    permissions?: string[],
  ): SearchField {
    return {
      key,
      name,
      validation,
      defaultCondition,
      exceptConditions,
      conditionsForValidation,
      type: SearchTypes.numberIdentifier,
      permissions,
    };
  }

  public static stringIdentifier(
    key: string,
    name: string,
    defaultCondition?: SearchConditionsEnum,
    exceptConditions?: SearchConditionsEnum[],
    conditionsForValidation?: SearchConditionsEnum[],
    trimTerm?: Function,
    permissions?: string[],
  ): SearchField {
    return {
      key,
      name,
      defaultCondition,
      exceptConditions,
      conditionsForValidation,
      trimTerm,
      type: SearchTypes.stringIdentifier,
      permissions,
    };
  }

  public static number(
    key: string,
    name: string,
    validation?: Function,
    exceptConditions?: SearchConditionsEnum[],
    permissions?: string[],
  ): SearchField {
    return {
      key,
      name,
      validation,
      exceptConditions,
      type: SearchTypes.number,
      permissions,
    };
  }

  public static textPrimary(
    key: string,
    name: string,
    primaryKey: string,
    validation?: Function,
    conditionsForValidation?: SearchConditionsEnum[],
    trimTerm?: Function,
    permissions?: string[],
  ): SearchField {
    return {
      key,
      name,
      primaryKey,
      validation,
      conditionsForValidation,
      trimTerm,
      type: SearchTypes.textPrimary,
      permissions,
    };
  }

  public static boolean(
    key: string,
    name: string,
    primaryKey?: string,
    primaryLabel?: string,
    keyCondition?: string,
    additionalFieldKeys?: SearchField[],
    permissions?: string[],
    defaultTerm?: string,
    checkboxHidden?: boolean,
    tooltipText?: string,
  ): SearchField {
    return {
      key,
      name,
      primaryKey,
      primaryLabel,
      keyCondition,
      additionalFieldKeys,
      type: SearchTypes.boolean,
      permissions,
      defaultTerm: defaultTerm || true,
      checkboxHidden,
      tooltipText,
    };
  }

  public static none(
    key: string,
    name: string,
    groupType: SearchGroupType,
    additionalFieldKeys?: SearchField[],
    allAdditionalFieldsRequired? : boolean,
    permissions?: string[],
  ): SearchField {
    return {
      key,
      name,
      groupType,
      additionalFieldKeys,
      allAdditionalFieldsRequired,
      type: SearchTypes.none,
      permissions,
    };
  }

  public static data(
    key: string,
    name: string,
    optionId?: string,
    optionValue?: string,
    defaultCondition?: SearchConditionsEnum,
    exceptConditions?: SearchConditionsEnum[],
    placeholder?: boolean,
    options?: Observable<SelectOption[]> | SelectOption[],
    groupType?: SearchGroupType,
    additionalFieldKeys?: SearchField[],
    onTermChange?: (value: any) => void,
    onConditionChange?: (value: string) => void,
    permissions?: string[],
  ): SearchField {
    return {
      key,
      name,
      optionId,
      optionValue,
      defaultCondition,
      exceptConditions,
      placeholder,
      options,
      groupType,
      additionalFieldKeys,
      onTermChange,
      onConditionChange,
      type: SearchTypes.data,
      permissions,
    };
  }

  public static dataWithCheckbox(
    key: string,
    name: string,
    optionId?: string,
    optionValue?: string,
    defaultCondition?: SearchConditionsEnum,
    exceptConditions?: SearchConditionsEnum[],
    placeholder?: boolean,
    termsToShowCheckbox?: string[] | number[],
    checkboxLabel?: string,
    mutualExclusion?: boolean,
    options?: Observable<SelectOption[]> | SelectOption[],
    groupType?: SearchGroupType,
    additionalFieldKeys?: SearchField[],
    onTermChange?: (value: any) => void,
    onConditionChange?: (value: string) => void,
    permissions?: string[],
  ): SearchField {
    return {
      key,
      name,
      optionId,
      optionValue,
      defaultCondition,
      exceptConditions,
      placeholder,
      options,
      groupType,
      additionalFieldKeys,
      onTermChange,
      onConditionChange,
      type: SearchTypes.dataWithCheckbox,
      permissions,
      termsToShowCheckbox,
      checkboxLabel,
      mutualExclusion,
    };
  }

  public static in(
    key: string,
    name: string,
    optionId?: string,
    optionValue?: string,
    defaultCondition?: SearchConditionsEnum,
    exceptConditions?: SearchConditionsEnum[],
    placeholder?: boolean,
    options?: Observable<SelectOption[]> | SelectOption[],
    groupType?: SearchGroupType,
    additionalFieldKeys?: SearchField[],
    onTermChange?: (value: any) => void,
    onConditionChange?: (value: string) => void,
    permissions?: string[],
  ): SearchField {
    return {
      key,
      name,
      optionId,
      optionValue,
      defaultCondition,
      exceptConditions,
      placeholder,
      options,
      groupType,
      additionalFieldKeys,
      onTermChange,
      onConditionChange,
      type: SearchTypes.in,
      permissions,
    };
  }

  public static age(
    key: string,
    name: string,
    defaultCondition: SearchConditionsEnum,
    permissions?: string[],
  ): SearchField {
    return {
      key,
      name,
      defaultCondition,
      type: SearchTypes.age,
      permissions,
    };
  }

  public static date(
    key: string,
    name: string,
    noUtc?: boolean,
    exceptConditions?: SearchConditionsEnum[],
    permissions?: string[],
  ): SearchField {
    return {
      key,
      name,
      noUtc,
      exceptConditions,
      type: SearchTypes.date,
      permissions,
    };
  }
}
