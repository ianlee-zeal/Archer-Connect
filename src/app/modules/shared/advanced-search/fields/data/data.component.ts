/* eslint-disable no-param-reassign */
import { Component, OnInit, Input, OnDestroy, SimpleChanges } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { ApiService } from '@app/services/';
import { SearchState } from '@app/models/advanced-search/search-state';
import { SearchConditionsEnum } from '@app/models/advanced-search/search-conditions.enum';
import { SelectHelper } from '@app/helpers/select.helper';
import { CommonHelper } from '@app/helpers/common.helper';
import { distinctUntilChanged } from 'rxjs/operators';
// eslint-disable-next-line import/no-extraneous-dependencies
import isEqual from 'lodash/isEqual';
import { StringHelper } from '@app/helpers';
import { SearchGroupType } from '@app/models/enums';
import { SelectOption } from '../../../_abstractions/base-select';
import { BaseSearchField } from '../base-search-field';
import { SearchField } from '@app/models/advanced-search/search-field';

@Component({
  selector: 'app-advanced-search-field-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
  providers: [
    {
      provide: BaseSearchField,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: AdvancedSearchFieldDataComponent,
    },
  ],
})
export class AdvancedSearchFieldDataComponent extends BaseSearchField implements OnInit, OnDestroy {
  @Input() public entry: SearchState;

  private readonly DEFAULT_HEIGHT_BY_COUNT = 6;
  public isRequiredValidationDisabled: boolean;
  public conditions = SearchConditionsEnum;
  public options: SelectOption[] = [];

  private idList: number[] = [];
  private optionsChangeSubscription: Subscription;
  private initialEntry: SearchState;

  constructor(
    private service: ApiService,
  ) {
    super();
  }

  public get isAllOptionsSelected(): boolean {
    return this.entry.isAllOptionsSelected;
  }

  public get multiselectListWidth(): number {
    return this.entry.field.groupType === SearchGroupType.BoundedByCountHeight ? 350 : null;
  }

  public get heightByCount(): number {
    return this.entry.field.groupType === SearchGroupType.BoundedByCountHeight ? this.DEFAULT_HEIGHT_BY_COUNT : 0;
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.loadOptions();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    const { entry } = this;
    const entryChange = changes[CommonHelper.nameOf({ entry })];
    if (!entryChange) {
      return;
    }

    this.entry.options = entryChange.currentValue.options;
    this.loadOptions();
  }

  public onChangeCondition(value): void {
    super.onChangeCondition(value);

    this.entry.term = null;
    this.idList = [];
  }

  public onChangeSearch(value): void {
    super.onChangeSearch(value);

    if (this.entry.field.onTermChange) {
      this.entry.field.onTermChange(value);
    }
  }

  public onChangeCheckbox({ id, checked }): void {
    if (checked) {
      this.idList.push(id);
    } else {
      this.idList.splice(this.idList.indexOf(id), 1);
    }

    this.entry.isAllOptionsSelected = this.idList.length === this.options.length;
    this.entry.term = this.idList.join(',');

    if (this.entry.field.onTermChange) {
      this.entry.field.onTermChange(this.idList);
    }
  }

  public onSelectAllChange(isChecked: boolean): void {
    if (isChecked) {
      const selectedIds: number[] = [];
      const selectedOptions: SelectOption[] = [];

      this.options.forEach(o => {
        selectedOptions.push({ ...o, checked: true });
        selectedIds.push(o.id as number);
      });

      this.idList = selectedIds;
      this.options = selectedOptions;
    } else {
      this.options = this.options.map(o => ({ ...o, checked: false }));
      this.idList = [];
    }

    this.entry.isAllOptionsSelected = this.idList.length === this.options.length;
    this.entry.term = this.idList.join(',');

    if (this.entry.field.onTermChange) {
      this.entry.field.onTermChange(this.idList);
    }
  }

  public ngOnDestroy(): void {
    if (this.optionsChangeSubscription) {
      this.optionsChangeSubscription.unsubscribe();
    }
  }

  protected validate(): void {
    super.validate();

    if (this.hasErrors() || this.condition === this.conditions.IsMissing) {
      return;
    }

    if ((!this.condition) || (!this.entry.term && !this.isRequiredValidationDisabled)) {
      this.entry.errors.term = { required: true };
    }
  }

  public loadOptions(): void {
    const { field } = this.entry;
    if (this.entry.options) {
      this.setOptionsAndTerms(field, this.entry.options);
    } else if (field.options) {
      if (field.options instanceof Observable) {
        if (this.optionsChangeSubscription) {
          // If the same field was changed - do not create new subscription
          if (StringHelper.equal(this.initialEntry?.field?.key, this.entry?.field?.key)) {
            return;
          }
          // If field is different - unsubscribe from the old subscription
          this.optionsChangeSubscription.unsubscribe();
        }

        this.optionsChangeSubscription = field.options
          .pipe(distinctUntilChanged((x, y) => isEqual(x, y)))
          .subscribe(options => {
            this.initialEntry = { ...this.entry };
            this.entry.term = isEqual(this.entry, this.initialEntry) ? this.entry.term : null;
            this.idList = [];
            this.options = SelectHelper.toOptions(
              options,
              option => option[field.optionId],
              option => option[field.optionValue],
            );
            if (this.entry.condition === SearchConditionsEnum.Contains
              && typeof this.entry.term === 'string'
              && this.entry.term) {
              const terms = this.entry.term ? this.entry.term.split(',') : [];
              if (terms.length) {
                this.options.forEach(option => {
                  option.checked = !!terms.find(term => option.id === +term);
                  if (option.checked) {
                    this.idList.push(<number>option.id);
                  }
                });
                if (this.entry.field.onTermChange) {
                  this.entry.field.onTermChange(this.idList);
                }
              }
            }
          });
      } if (field.options instanceof Array) {
        this.setOptionsAndTerms(field, field.options);
      }
    } else if (field.endpoint) {
      // Getting data from the server
      this.service.get<any>(field.endpoint).subscribe(data => {
        this.options = SelectHelper
          .toOptions(data, item => item[field.optionId], item => item[field.optionValue])
          .sort((a, b) => (a.name ? a.name.localeCompare(b.name) : 1));
      });
    }

    if (this.entry.isAllOptionsSelected) {
      this.options.forEach(o => { o.checked = true; });
    }
  }

  private setOptionsAndTerms(field: SearchField, opts: SelectOption[]): void {
    this.initialEntry = null;
    this.idList = [];
    const options = SelectHelper.toOptions(
      opts,
      option => option[field.optionId],
      option => option[field.optionValue],
    );
      // Restore state for entry with child options
    if (this.condition === SearchConditionsEnum.Contains
        && typeof this.entry.term === 'string'
        && this.entry.term) {
      const terms = this.entry.term ? this.entry.term.split(',') : [];
      if (terms.length) {
        options.forEach(option => {
          // eslint-disable-next-line no-param-reassign
          option.checked = !!terms.find(term => option.id === +term);
          if (option.checked) {
            this.idList.push(<number>option.id);
          }
        });
        this.entry.term = this.idList.join(',');
        if (this.entry.field.onTermChange) {
          this.entry.field.onTermChange(this.idList);
        }
      }
    }
    this.options = options;
  }

  // Determine whether to show the multiselect.
  // This serves as an interim solution until all advanced searches are transitioned to the new multiselect format.
  public showMultiselectWithChips(): boolean {
    const allowedKeys = [
      'accountGroupId',
      'accountId',
      'bKScrubProductCode',
      'bKScrubStatus.id',
      'ledgersStages.id',
      'clientWorkflow.stage.id',
      'disbursementGroupId',
      'firmApprovedStatusName',
      'holdbacks',
      'holdbackAccount',
      'holdTypeReason.holdTypeId',
      'holdTypeReason.holdTypeReasonId',
      'ledgersStages.id',
      'lienPaymentStageId',
      'payeeOrgId',
      'payerAccount.id',
      'productWorkflow.stage.id',
      'stage.id',
      'statusId',
      'unpaidLedgerEntriesAccount',
      'overallInvoiceApprovalStatusId',
      'ledgerFirmApprovedStatusId',
    ];
    return allowedKeys.includes(this.entry.field.key);
  }
}
