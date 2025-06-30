import { OnChanges, SimpleChanges, AfterContentChecked, EventEmitter, Output, Input, OnInit, Directive } from '@angular/core';
import memoize from 'lodash.memoize';

import { SearchState } from '@app/models/advanced-search/search-state';
import { SearchConditionsEnum } from '@app/models/advanced-search/search-conditions.enum';
import { CommonHelper } from '@app/helpers/common.helper';
import { SearchTypes } from '@app/models/advanced-search/search-types.hash';

const exceptConditions = memoize((conditions: SearchConditionsEnum[], onesToExcept: SearchConditionsEnum[]) => {
  if (!onesToExcept || !onesToExcept.length) {
    return conditions;
  }

  return conditions.filter(condition => !onesToExcept.includes(condition));
}, CommonHelper.multipleParamsMemoizationResolver);

@Directive()
export abstract class BaseSearchField implements OnChanges, OnInit, AfterContentChecked {
  @Output() public onSubmit = new EventEmitter();
  @Output() public markAsEdited = new EventEmitter();
  @Input() protected abstract isRequiredValidationDisabled: boolean;

  public abstract entry: SearchState;
  public conditions = SearchConditionsEnum;
  public conditionOptions: string[] = [];

  public get condition(): SearchConditionsEnum {
    return this.entry && this.entry.condition || null;
  }

  public set condition(value: SearchConditionsEnum) {
    if (this.entry) {
      this.entry.condition = value;
    }
  }

  public isValidationEqualsRequired(term): boolean {
    return term.hasOwnProperty('required');
  }

  public hasError(term): boolean {
    return term && !this.isValidationEqualsRequired(term);
  }
  protected validate(): void {
    if (!this.entry) {
      return;
    }

    this.entry.errors = {};

    if (!this.condition) {
      this.entry.errors.condition = { required: true };
    }
  }

  public get isValid(): boolean {
    return !this.hasErrors();
  }

  protected hasErrors(): boolean {
    if (!this.entry) {
      return true;
    }

    const { errors } = this.entry;

    return errors !== null && !!Object.keys(errors).length;
  }

  ngOnInit(): void {
    this.condition = this.entry?.condition || this.entry?.field?.defaultCondition;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const { entry } = this;
    const entryChange = changes[CommonHelper.nameOf({ entry })];
    if (!entryChange || entry.field.type === SearchTypes.none) {
      return;
    }
    this.conditionOptions = exceptConditions(entry.field.type.conditions, entry.field.exceptConditions);
  }

  public ngAfterContentChecked(): void {
    this.validate();
  }

  public onChangeCondition(value: SearchConditionsEnum): void {
    this.condition = value;
    this.entry.errors = {};

    this.markAsEdited.emit();

    if (this.condition === SearchConditionsEnum.IsMissing) {
      this.entry.term = null;
      this.entry.termTo = null;
    }

    if (this.entry.field.onConditionChange) {
      this.entry.field.onConditionChange(value);
    }
  }

  public onChangeSearch(value): void {
    this.entry.term = value;
    this.markAsEdited.emit();
  }
}
