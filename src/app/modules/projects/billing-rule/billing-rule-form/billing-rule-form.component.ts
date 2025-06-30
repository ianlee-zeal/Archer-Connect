/* eslint-disable no-param-reassign */
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActionsSubject, Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { KeyValuePair } from '@app/models/utils';
import { BillingRuleTemplate } from '@app/models/billing-rule/billing-rule-template';
import { BillingRule, BillingRuleDto } from '@app/models/billing-rule/billing-rule';
import { ModalService, ValidationService } from '@app/services';
import { PriceType } from '@app/models/enums/billing-rule/price-type.enum';
import { OutcomeBasedPricing } from '@app/models/billing-rule/outcome-based-pricing';
import { IdValue, Org } from '@app/models';
import { PriceInputValue } from '@app/modules/shared/price-input/price-input.component';
import { ToggleState } from '@app/models/enums/toggle-state.enum';
import { FeeSplit } from '@app/models/billing-rule/fee-split';
import { BillingRuleTriggerTiming } from '@app/models/enums/billing-rule/timing.enum';
import { BillingRuleRelatedService, BillingRuleRelatedServiceDto } from '@app/models/billing-rule/billing-rule-related-service';
import { BillingRuleRelatedServiceGridItem } from '@app/models/billing-rule/billing-rule-related-service-item';
import { BillingTrigger } from '@app/models/billing-rule/billing-trigger';
import { OutcomeBasedPricingDetails } from '@app/models/billing-rule/outcome-based-pricing-details';
import { Subject } from 'rxjs';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { ofType } from '@ngrx/effects';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityTypeEnum } from '@app/models/enums';
import { RelatedServicesModalComponent } from '@app/modules/shared/entity-selection-modal/related-services-modal.component';
import { FeeScopeEnum } from '@app/models/enums/billing-rule/fee-scope.enum';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { OrganizationSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/organization-selection-modal.component';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ChipListOption } from '@app/models/chip-list-option';
import { TriggerType, AutomatedTriggersIds } from '@app/models/enums/billing-rule/trigger-type.enum';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { OrgType } from '@app/models/enums/ledger-settings/org-type';
import { IdValueOptionSelectionModal } from '@app/modules/shared/entity-selection-modal/idvalue-options-selection-modal.component';
import { VariablePricingFormValue } from '@app/modules/shared/variable-pricing-form/variable-pricing-form.component';
import isNumber from 'lodash-es/isNumber';
import { ProductCategoryEnum } from '@app/models/enums/billing-rule/product-category.enum';
import * as fromShared from '@shared/state';
import { GridId } from '@app/models/enums/grid-id.enum';
import { BillingRuleHelper, ArrayHelper, CommonHelper } from '@app/helpers';

import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import * as outcomeBasedPricingActions from '@app/modules/shared/state/outcome-based-pricing/actions';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';

import { OutcomeBasedPricingModalComponent } from '../../../shared/outcome-based-pricing-list/outcome-based-pricing-modal/outcome-based-pricing-modal.component';
import * as projectSelectors from '../../state/selectors';
import { FeeSplitListComponent } from '../fee-split-list/fee-split-list.component';
import { FilterModel } from '@app/models/advanced-search/filter-model';

const { sharedSelectors } = fromShared;

export interface BillingRuleFormValue {
  name: string;
  billingRuleTemplate: BillingRuleTemplate;
  feeScope: IdValue;
  chartOfAccount: IdValue;
  services: BillingRuleRelatedServiceGridItem[];
  minFee: PriceInputValue;
  maxFee: PriceInputValue;
  outcomeBasedPricing: boolean;
  variablePricingApplies: boolean;
  price: PriceInputValue;
  revRecMethod: IdValue;
  iliAutoGeneration: boolean;
  billingTriggers: ChipListOption[];
  pricingTriggers: ChipListOption[];
  feeSplit: boolean;
  pricingTerms: string;
  invoicingTerms: string;
  paymentTerms: string;
  revRecTerms: string;
  status: IdValue;
  relatedServiceRequired: boolean;
  isCollectorSpecific: boolean;
  collectorOrg: IdValue;
  invoicingItem: IdValue;
  revRecItem: IdValue;
}

@Component({
  selector: 'app-billing-rule-form',
  templateUrl: './billing-rule-form.component.html',
  styleUrls: ['./billing-rule-form.component.scss'],
})
export class BillingRuleFormComponent extends ValidationForm implements OnInit, OnDestroy {
  @Input() billingRule: BillingRule;
  @ViewChild('feeSplitList') feeSplitListComponent: FeeSplitListComponent;

  private projectId: number;
  public tortId: number;
  private readonly ngUnsubscribe$ = new Subject<void>();
  private readonly project$ = this.store.select(projectSelectors.item);
  public readonly projectQsfOrg$ = this.store.select(selectors.projectQsfOrg);
  private triggerTypes: IdValue[] = [];
  public readonly triggerTypes$ = this.store.select(sharedSelectors.outcomeBasedPricingSelectors.triggerTypes);
  public readonly organizations$ = this.store.select(selectors.orgs);
  public readonly revRecMethods$ = this.store.select(selectors.revRecMethods);
  public readonly feeScopes$ = this.store.select(selectors.feeScopes);
  public readonly chartOfAccounts$ = this.store.select(selectors.chartOfAccounts);
  public readonly variablePricingTypes$ = this.store.select(sharedSelectors.outcomeBasedPricingSelectors.variablePricingTypes);
  public readonly billingRuleTemplates$ = this.store.select(selectors.billingRuleTemplates);
  public readonly statuses$ = this.store.select(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.BillingRule }));
  public readonly priceTypeEnum = PriceType;
  public readonly toggleStateEnum = ToggleState;
  public readonly feeScopeEnum = FeeScopeEnum;
  public billingTriggerDropdownOpts: SelectOption[] = [];
  public pricingTriggerDropdownOpts: SelectOption[] = [];
  public minMaxFeePlaceholders = {
    [PriceType.Amount]: 'Price',
    [PriceType.Percentage]: 'Percentage of GSV',
  };
  public relatedServices:BillingRuleRelatedServiceGridItem[] = [];
  public readonly additionalPageItemsCountValues = [5];
  public gridId = GridId;

  public feeSplits: FeeSplit[] = [];
  public outcomeBasedPricings: OutcomeBasedPricing[] = [];
  public variablePricing: VariablePricingFormValue;
  public form: UntypedFormGroup = new UntypedFormGroup({
    name: new UntypedFormControl(null, [Validators.required, ValidationService.notEmptyValidator]),
    billingRuleTemplate: new UntypedFormControl(null, [Validators.required]),
    feeScope: new UntypedFormControl(null, [Validators.required]),
    chartOfAccount: new UntypedFormControl(null),
    services: new UntypedFormControl([], [Validators.required]),
    minFee: new UntypedFormControl(new PriceInputValue(null, PriceType.Amount)),
    maxFee: new UntypedFormControl(new PriceInputValue(null, PriceType.Amount)),
    outcomeBasedPricing: new UntypedFormControl(false, [Validators.required]),
    variablePricingApplies: new UntypedFormControl(false, [Validators.required]),
    price: new UntypedFormControl(null, [ValidationService.requiredPrice]),
    revRecMethod: new UntypedFormControl(null, [Validators.required]),
    iliAutoGeneration: new UntypedFormControl(null),
    billingTriggers: new UntypedFormControl([]),
    pricingTriggers: new UntypedFormControl([]),
    feeSplit: new UntypedFormControl(null),
    pricingTerms: new UntypedFormControl(null),
    invoicingTerms: new UntypedFormControl(null),
    paymentTerms: new UntypedFormControl(null),
    revRecTerms: new UntypedFormControl(null),
    relatedServiceRequired: new UntypedFormControl(false, [Validators.required]),
    isCollectorSpecific: new UntypedFormControl(false, [Validators.required]),
    collectorOrg: new UntypedFormControl(null),
    invoicingItem: new UntypedFormControl(null),
    revRecItem: new UntypedFormControl(null),
  });

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get isFormValid(): boolean {
    return (
      this.form.valid
      && this.isFeeSplitsValid()
      && this.isOutcomeBasedPricingValid()
      && this.isVariablePricingValid()
      && this.isRelatedServicesSelectionValid()
    );
  }

  public get isCollectorSpecific() {
    return BillingRuleHelper.isTrue(this.form, 'isCollectorSpecific');
  }

  public get isOutcomeBasedPricing() {
    return BillingRuleHelper.isTrue(this.form, 'outcomeBasedPricing');
  }

  public get isVariablePricingApplies() {
    return BillingRuleHelper.isTrue(this.form, 'variablePricingApplies');
  }

  public get isRelatedServiceRequired() {
    return BillingRuleHelper.isTrue(this.form, 'relatedServiceRequired');
  }

  public get isFeeSplit() {
    return BillingRuleHelper.isTrue(this.form, 'feeSplit');
  }

  public get iliAutoGeneration() {
    return this.form.get('iliAutoGeneration')?.value;
  }

  public get relatedServiceRequiredMessage(): string {
    const feeScope = this.form.get('feeScope')?.value?.id;
    return BillingRuleHelper.getRelatedServiceRequiredMessage(feeScope, this.isRelatedServiceRequired);
  }

  constructor(
    private store: Store<any>,
    private modalService: ModalService,
    private actionSubj: ActionsSubject,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.GetChartOfAccounts());
    this.store.dispatch(actions.GetFeeScopes());
    this.store.dispatch(actions.GetRevRecMethods());
    this.store.dispatch(outcomeBasedPricingActions.GetTriggerTypes());
    this.store.dispatch(outcomeBasedPricingActions.GetVariablePricingTypes());
    this.subscribeToCurrentProject();
    this.subscribeToFormValueChange();
    this.subscribeToFeeScopeChange();
    this.subscribeToActions();
    this.subscribeToTriggerTypes();
    this.subscribeToPricingTriggersChange();
    this.subscribeToBillingTriggersChange();
    this.subscribeToOutcomeBasedPricingChange();
    this.subscribeToIsCollectorSpecificChange();
    this.subscribeToRelatedServiceRequiredChange();

    const isEditingExistingBillingRule = !!this.billingRule;

    if (isEditingExistingBillingRule) {
      this.form.addControl('status', new UntypedFormControl(null, [Validators.required]));
      this.initValuesForEditing();
      this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.BillingRule }));
    }
  }

  public isFeeSplitsValid(): boolean {
    const formValue: BillingRuleFormValue = this.form.value;

    return !formValue.feeSplit || this.feeSplitListComponent?.isValid;
  }

  public isOutcomeBasedPricingValid(): boolean {
    return this.isOutcomeBasedPricing ? !!this.outcomeBasedPricings?.length : true;
  }

  public isVariablePricingValid(): boolean {
    return this.isVariablePricingApplies ? !!this.variablePricing?.variablePricingTypeId : true;
  }

  public isRelatedServicesSelectionValid(): boolean {
    return !!this.relatedServices?.length;
  }

  public onSave(): void {
    this.validate();

    if (this.form.invalid) {
      return;
    }

    if (this.billingRule) {
      this.updateBillingRule();
    } else {
      this.createBillingRule();
    }
  }

  public searchFn = () => true;

  public onSearchBillingRuleTemplates(brtName: string): void {
    this.store.dispatch(actions.SearchBillingRuleTemplates({ brtName }));
  }

  public onBillingTriggersDropdownChange(billingTriggerOption: SelectOption): void {
    this.onTriggersChange(billingTriggerOption, 'billingTriggers');
  }

  public onPricingTriggersDropdownChange(pricingTriggerOption: SelectOption): void {
    this.onTriggersChange(pricingTriggerOption, 'pricingTriggers');
  }

  public onBillingRuleTemplateChange(brt: BillingRuleTemplate): void {
    if (!brt) return;

    const maxFeeType = isNumber(brt.maxFeePct) ? PriceType.Percentage : PriceType.Amount;
    const minFeeType = isNumber(brt.minFeePct) ? PriceType.Percentage : PriceType.Amount;
    const patch: any = {
      name: brt.description,
      revRecMethod: brt.revRecMethod ?? null,
      revRecItem: brt.revRecItem ?? null,
      invoicingItem: brt.invoicingItem ?? null,
      isCollectorSpecific: Boolean(brt.collectorOrg),
      collectorOrg: brt.collectorOrg ? new IdValue(brt.collectorOrg.id, brt.collectorOrg.name) : null,
      maxFee: new PriceInputValue(maxFeeType === PriceType.Amount ? brt.maxFee : brt.maxFeePct, maxFeeType),
      minFee: new PriceInputValue(minFeeType === PriceType.Amount ? brt.minFee : brt.minFeePct, minFeeType),
      outcomeBasedPricing: brt.isOutcomeBased,
      chartOfAccount: brt.chartOfAccount,
      outcomeBasedScenarios: brt.outcomeBasedScenarios,
      price: brt.pricePct
        ? new PriceInputValue(brt.pricePct, PriceType.Percentage)
        : new PriceInputValue(brt.price, PriceType.Amount),
      relatedServiceRequired: Boolean(brt.relatedServiceRequired),
      iliAutoGeneration: brt.iliAutoGeneration,
      variablePricingApplies: brt.isVariable,
      feeSplit: this.isFeeSplit || false,
      feeScope: brt.feeScope,
      services: brt.relatedServices?.length
        ? BillingRuleRelatedServiceGridItem.convertToItems(brt.relatedServices)
        : [],
      billingTriggers: brt.billingTriggers?.length
        ? brt.billingTriggers.filter(p => p.timing === 'B').map(ChipListOption.billingTriggerToModel)
        : [],
      pricingTriggers: brt.billingTriggers?.length
        ? brt.billingTriggers.filter(p => p.timing === 'P').map(ChipListOption.billingTriggerToModel)
        : [],
    };

    this.relatedServices = patch.services;
    this.outcomeBasedPricings = brt.outcomeBasedScenarios?.length
      ? brt.outcomeBasedScenarios.map(scenario => ({ ...scenario, id: 0 }))
      : [];

    this.variablePricing = {
      tieredPricings: brt.details?.tieredPricings ?? [],
      percentageOfSavingsPricings: brt.details?.percentageOfSavingsPricings ?? [],
      slidingScalePricings: brt.details?.slidingScalePricings ?? [],
      variablePricingType: brt.variablePricingType,
      variablePricingTypeId: brt.variablePricingTypeId,
      defaultPrice: brt.details?.defaultPrice,
      defaultPriceType: brt.details?.defaultPriceType,
    };

    this.form.patchValue(patch);
    this.applyAutomatedTriggers();
    this.form.updateValueAndValidity();
  }

  public onAddOutcomeBasedPricing(): void {
    this.modalService.show(OutcomeBasedPricingModalComponent, {
      class: 'outcome-based-pricing-modal',
      initialState: {
        addHandler: (obp: OutcomeBasedPricing) => {
          this.outcomeBasedPricings = [...this.outcomeBasedPricings, obp];
        },
      },
    });
  }

  public onEditOutcomeBasedPricing(index: number): void {
    this.modalService.show(OutcomeBasedPricingModalComponent, {
      class: 'outcome-based-pricing-modal',
      initialState: {
        pricing: this.outcomeBasedPricings[index],
        addHandler: (obp: OutcomeBasedPricing) => {
          this.outcomeBasedPricings[index] = obp;
          this.outcomeBasedPricings = [...this.outcomeBasedPricings];
        },
      },
    });
  }

  public onVariablePricingChange(val: VariablePricingFormValue): void {
    this.variablePricing = val;
  }

  public onDeleteOutcomeBasedPricing(indexOfDeleted: number): void {
    this.outcomeBasedPricings.splice(indexOfDeleted, 1);
    this.outcomeBasedPricings = [...this.outcomeBasedPricings];
  }

  public onOpenCollectorSearchModal(): void {
    this.modalService.show(OrganizationSelectionModalComponent, {
      initialState: {
        onEntitySelected: (org: Org) => {
          this.form.patchValue({ collectorOrg: new IdValue(org.id, org.name) });
          this.form.updateValueAndValidity();
        },
        gridDataFetcher: (params: IServerSideGetRowsParamsExtended) => {
          params.request.filterModel.push(new FilterModel({
            filter: OrgType.LienCollector,
            filterType: FilterTypes.Number,
            type: 'equals',
            key: 'primaryOrgType.id',
          }));

          this.store.dispatch(sharedActions.SearchOrganizations({ params }));
        },
      },
      class: 'entity-selection-modal',
    });
  }

  public onOpenInvoicingItemSearchModal(): void {
    this.modalService.show(IdValueOptionSelectionModal, {
      initialState: {
        title: 'Select Invoicing Item',
        entityLabel: 'Invoicing Items',
        onEntitySelected: (invoicingItem: IdValue) => {
          this.form.patchValue({ invoicingItem });
          this.form.updateValueAndValidity();
        },
        gridDataFetcher: (params: IServerSideGetRowsParamsExtended) => {
          this.store.dispatch(sharedActions.SearchInvoicingItems({ params }));
        },
      },
      class: 'entity-selection-modal',
    });
  }

  public onOpenRevRecItemSearchModal(): void {
    this.modalService.show(IdValueOptionSelectionModal, {
      initialState: {
        title: 'Select Rev Rec Item',
        entityLabel: 'Rev Rec Items',
        onEntitySelected: (revRecItem: IdValue) => {
          this.form.patchValue({ revRecItem });
          this.form.updateValueAndValidity();
        },
        gridDataFetcher: (params: IServerSideGetRowsParamsExtended) => {
          this.store.dispatch(sharedActions.SearchRevRecItems({ params }));
        },
      },
      class: 'entity-selection-modal',
    });
  }

  public onInvoicingItemClear(): void {
    this.form.patchValue({ invoicingItem: null });
    this.form.updateValueAndValidity();
  }

  public onRevRecItemClear(): void {
    this.form.patchValue({ revRecItem: null });
    this.form.updateValueAndValidity();
  }

  public onCollectorInputClear(): void {
    this.form.patchValue({ collectorOrg: null });
    this.form.updateValueAndValidity();
  }

  private subscribeToOutcomeBasedPricingChange() {
    this.form.controls.outcomeBasedPricing.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((value: boolean) => {
        this.updateAutomatedTriggers(TriggerType.OutcomeDetermined, value);
      });
  }

  private subscribeToPricingTriggersChange() {
    this.form.controls.pricingTriggers.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((pricingTriggers: ChipListOption[]) => {
        this.updatePricingTriggerDropdownOptions(pricingTriggers);
      });
  }

  private subscribeToBillingTriggersChange() {
    this.form.controls.billingTriggers.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((billingTriggers: ChipListOption[]) => {
        this.updateBillingTriggerDropdownOptions(billingTriggers);
      });
  }

  private subscribeToTriggerTypes() {
    this.triggerTypes$
      .pipe(
        filter(triggerTypes => !!triggerTypes),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((triggerTypes: IdValue[]) => {
        this.triggerTypes = triggerTypes;
        this.updateBillingTriggerDropdownOptions(this.form.controls.billingTriggers.value);
        this.updatePricingTriggerDropdownOptions(this.form.controls.pricingTriggers.value);
      });
  }

  private updateBillingTriggerDropdownOptions(selectedBillingTriggers: ChipListOption[]): void {
    const updatedBillingTriggerDropdownOpts: SelectOption[] = [];

    for (const trigger of this.triggerTypes) {
      if (AutomatedTriggersIds.includes(trigger.id)) continue;
      const checked = selectedBillingTriggers.some(selectedTrigger => +selectedTrigger.id === trigger.id);
      updatedBillingTriggerDropdownOpts.push({
        id: trigger.id,
        name: trigger.name,
        checked,
      });
    }

    this.billingTriggerDropdownOpts = updatedBillingTriggerDropdownOpts;
  }

  private updatePricingTriggerDropdownOptions(selectedPricingTriggers: ChipListOption[]): void {
    const updatedPricingTriggerDropdownOpts: SelectOption[] = [];

    for (const trigger of this.triggerTypes) {
      if (AutomatedTriggersIds.includes(trigger.id)) continue;
      const checked = selectedPricingTriggers.some(selectedTrigger => +selectedTrigger.id === trigger.id);
      updatedPricingTriggerDropdownOpts.push({
        id: trigger.id,
        name: trigger.name,
        checked,
      });
    }

    this.pricingTriggerDropdownOpts = updatedPricingTriggerDropdownOpts;
  }

  private onTriggersChange(triggerOption: SelectOption, triggersControlName: string) {
    if (!triggerOption) {
      return;
    }

    const existingTriggers: ChipListOption[] = this.form.value[triggersControlName];
    const patch = { [triggersControlName]: existingTriggers };

    if (triggerOption.checked && !existingTriggers.some(t => +t.id === triggerOption.id)) {
      patch[triggersControlName] = [...existingTriggers, { id: triggerOption.id.toString(), name: triggerOption.name, isRemovable: true }];
    } else if (!triggerOption.checked) {
      patch[triggersControlName] = existingTriggers.filter(t => +t.id !== triggerOption.id);
    }

    this.form.patchValue(patch);
    this.form.updateValueAndValidity();
  }

  private createBillingRule(): void {
    const dto = this.createDto();
    this.store.dispatch(actions.CreateBillingRule({ dto }));
  }

  private updateBillingRule(): void {
    const val: BillingRuleFormValue = this.form.value;
    const dto = this.createDto();
    dto.id = this.billingRule.id;
    dto.statusId = val.status.id;
    this.store.dispatch(actions.UpdateBillingRule({ dto }));
  }

  private createDto(): Partial<BillingRuleDto> {
    const formValue: BillingRuleFormValue = this.form.getRawValue();

    const dto: Partial<BillingRuleDto> = {
      billingRuleTemplateId: formValue.billingRuleTemplate?.id,
      paymentTerms: formValue.paymentTerms,
      caseId: this.projectId,
      feeScopeId: formValue.feeScope?.id,
      iliAutoGeneration: this.iliAutoGeneration,
      chartOfAccount: formValue.chartOfAccount,
      chartOfAccountId: formValue.chartOfAccount?.id,
      feeSplit: this.isFeeSplit,
      invoicingTerms: formValue.invoicingTerms,
      isOutcomeBased: this.isOutcomeBasedPricing,
      isVariable: this.isVariablePricingApplies,
      maxFee: formValue.maxFee?.type === PriceType.Amount ? formValue.maxFee.value : null,
      maxFeePct: formValue.maxFee?.type === PriceType.Percentage ? formValue.maxFee.value : null,
      minFee: formValue.minFee?.type === PriceType.Amount ? formValue.minFee.value : null,
      minFeePct: formValue.minFee?.type === PriceType.Percentage ? formValue.minFee.value : null,
      name: formValue.name,
      pricingTerms: formValue.pricingTerms,
      revRecTerms: formValue.revRecTerms,
      revRecMethodId: formValue.revRecMethod?.id,
      revRecItemId: formValue.revRecItem?.id,
      invoicingItemId: formValue.invoicingItem?.id,
      relatedServiceRequired: this.isRelatedServiceRequired,
      collectorOrgId: this.isCollectorSpecific ? formValue.collectorOrg.id : null,
      relatedServices: this.relatedServices[0]?.serviceName === ProductCategoryEnum[ProductCategoryEnum.All]
        ? [<BillingRuleRelatedServiceDto>{ productId: null, productCategoryId: ProductCategoryEnum.All }]
        : this.relatedServices.map(service => BillingRuleRelatedService.fromChipListOptionToDto(service as any)),
      billingTriggers: [
        ...formValue.billingTriggers.map(trigger => (
          <BillingTrigger>{
            timing: BillingRuleTriggerTiming.Billing,
            triggerTypeId: +trigger.id,
          }
        )),
        ...formValue.pricingTriggers.map(trigger => (
          <BillingTrigger>{
            timing: BillingRuleTriggerTiming.Pricing,
            triggerTypeId: +trigger.id,
          }
        )),
      ],
    };

    if (!dto.isOutcomeBased && !dto.isVariable) {
      dto.price = formValue.price?.type === PriceType.Amount ? formValue.price.value : null;
      dto.pricePct = formValue.price?.type === PriceType.Percentage ? formValue.price.value : null;
    }

    if (dto.isOutcomeBased) {
      dto.outcomeBasedScenarios = this.outcomeBasedPricings.map(OutcomeBasedPricing.toDto);
    }

    if (dto.isVariable) {
      dto.details = OutcomeBasedPricingDetails.toDto(this.variablePricing);
      dto.variablePricingTypeId = this.variablePricing?.variablePricingTypeId;
    }

    if (dto.feeSplit) {
      this.feeSplits.forEach((fs: FeeSplit) => { if (fs.id < 0) { fs.id = 0; } });
      dto.feeSplits = this.feeSplits.map(FeeSplit.toDto);
      dto.billToId = null;
      dto.orgId = this.billingRule?.org?.id;
    } else {
      const defaultFee = this.feeSplits[0];
      dto.feeSplits = [];
      dto.billToId = defaultFee.billTo?.id;
      dto.orgId = defaultFee.org?.id;
    }

    return dto;
  }

  private initValuesForEditing(): void {
    const br = this.billingRule;
    const patch: BillingRuleFormValue = {
      billingRuleTemplate: br.template,
      feeScope: br.feeScope,
      name: br.name,
      paymentTerms: br.paymentTerms,
      feeSplit: br.feeSplit,
      chartOfAccount: br.chartOfAccount,
      iliAutoGeneration: br.iliAutoGeneration,
      invoicingTerms: br.invoicingTerms,
      maxFee: new PriceInputValue(br.maxFee, br.maxFeeType),
      minFee: new PriceInputValue(br.minFee, br.minFeeType),
      outcomeBasedPricing: br.isOutcomeBased,
      price: new PriceInputValue(br.price, br.priceType),
      pricingTerms: br.pricingTerms,
      revRecMethod: br.revRecMethod,
      revRecTerms: br.revRecTerms,
      variablePricingApplies: br.isVariable,
      billingTriggers: br.billingTriggers.map(ChipListOption.billingTriggerToModel),
      pricingTriggers: br.pricingTriggers.map(ChipListOption.billingTriggerToModel),
      status: br.status,
      relatedServiceRequired: br.isRelatedServiceRequired,
      isCollectorSpecific: !!br.collectorOrg,
      collectorOrg: br.collectorOrg ? new IdValue(br.collectorOrg.id, br.collectorOrg.name) : null,
      invoicingItem: br.invoicingItem,
      revRecItem: br.revRecItem,
      services: br.relatedServices?.length
        ? BillingRuleRelatedServiceGridItem.convertToItems(br.relatedServices)
        : [],
    };

    this.relatedServices = patch.services;
    this.outcomeBasedPricings = br.outcomeBasedPricings;
    this.feeSplits = br.feeSplits?.length
      ? br.feeSplits
      : [{
        id: CommonHelper.createEntityUniqueId(),
        feePercentage: 1,
        org: this.billingRule?.org || null,
        orgName: this.billingRule?.org?.name || null,
        billTo: this.billingRule?.billTo || new IdValue(1, ''),
      }];

    this.variablePricing = {
      tieredPricings: br.details?.tieredPricings ?? [],
      percentageOfSavingsPricings: br.details?.percentageOfSavingsPricings ?? [],
      slidingScalePricings: br.details?.slidingScalePricings ?? [],
      variablePricingType: br.variablePricingType,
      variablePricingTypeId: br.variablePricingTypeId,
      defaultPrice: br.details?.defaultPrice,
      defaultPriceType: br.details?.defaultPriceType,
    };

    this.form.patchValue(patch);
    this.applyAutomatedTriggers();
    this.form.updateValueAndValidity();
  }

  public onOpenRelatedServicesModal(): void {
    const services: BillingRuleRelatedServiceGridItem[] = this.relatedServices;

    const selectedEntities: { key: string, value: string, selected: boolean }[] = services.map(service => {
      const description = service.productName
        ? `${service.serviceName} (${service.productName})`
        : `${service.serviceName}`;
      return {
        key: service.id,
        value: description,
        selected: true,
      };
    });

    this.modalService.show(RelatedServicesModalComponent, {
      initialState: {
        selectedEntities,
        onEntitySelected: (entity: KeyValuePair<string, string>[]) => this.onServiceChanged(entity),
      },
      class: 'entity-selection-modal',
    });
  }

  private onServiceChanged(services: KeyValuePair<string, string>[]): void {
    const chipListOptions: ChipListOption[] = services.map(s => ({ id: s.key, name: s.value, isRemovable: true }));
    const servicesList = BillingRuleRelatedServiceGridItem.chipListToItems(chipListOptions);
    this.relatedServices = servicesList;
    this.form.patchValue({ services: servicesList });
    this.form.updateValueAndValidity();
  }

  private subscribeToCurrentProject(): void {
    this.project$
      .pipe(
        filter(p => !!p),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(p => {
        this.projectId = p.id;
        this.tortId = p.tortId;
        this.store.dispatch(actions.GetProjectQsfOrg({ projectId: p.id }));
      });
  }

  private subscribeToFormValueChange(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((val: BillingRuleFormValue) => {
        this.setPriceControlValidators(val);
        this.setTriggersControlValidators(val);
      });
  }

  private subscribeToFeeScopeChange(): void {
    this.form.controls.feeScope.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((selectedFeeScope: IdValue) => {
        const control = this.form.get('isRelatedServiceRequired');
        BillingRuleHelper.updateIsRelatedServiceRequiredControl(control, selectedFeeScope);
      });
  }

  private subscribeToIsCollectorSpecificChange(): void {
    this.form.controls.isCollectorSpecific.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((value: boolean) => {
        this.updateCollectorOrgControl(value);
        this.updateAutomatedTriggers(TriggerType.CollectorMatch, value);
      });
  }

  private subscribeToRelatedServiceRequiredChange(): void {
    this.form.controls.relatedServiceRequired.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((value: boolean) => {
        this.updateAutomatedTriggers(TriggerType.RelatedServiceMatch, value);
      });
  }

  private applyAutomatedTriggers() {
    this.updateAutomatedTriggers(TriggerType.CollectorMatch, this.isCollectorSpecific);
    this.updateAutomatedTriggers(TriggerType.OutcomeDetermined, this.isOutcomeBasedPricing);
    this.updateAutomatedTriggers(TriggerType.RelatedServiceMatch, this.isRelatedServiceRequired);
  }

  private updateAutomatedTriggers(autoTrigger: IdValue, enable: boolean) {
    for (const groupName of ['pricingTriggers', 'billingTriggers']) {
      const selectedTriggers = this.form.get(groupName).value;
      const updatedTriggers = !enable
        ? selectedTriggers.filter(selectedTrigger => selectedTrigger.id != autoTrigger.id)
        : ArrayHelper.uniqEntities([
          ...selectedTriggers, {
            id: autoTrigger.id.toString(),
            name: autoTrigger.name,
            isRemovable: false,
          }]);

      this.form.get(groupName).setValue(updatedTriggers);
    }
  }

  private updateCollectorOrgControl(val: boolean): void {
    const control = this.form.get('collectorOrg');
    const opts = { emitEvent: false, onlySelf: true };

    control.setValue(null, opts);

    if (!val) {
      control.disable(opts);
      control.setValidators(null);
    } else {
      control.enable(opts);
      control.setValidators(Validators.required);
    }

    control.updateValueAndValidity(opts);
  }

  private setPriceControlValidators(val: BillingRuleFormValue): void {
    if (!val.outcomeBasedPricing && !val.variablePricingApplies) {
      this.form.controls.price.setValidators(ValidationService.requiredPrice);
    } else {
      this.form.controls.price.setValidators(null);
    }

    this.form.controls.price.updateValueAndValidity({ emitEvent: false });
  }

  private setTriggersControlValidators(val: BillingRuleFormValue): void {
    if (val.iliAutoGeneration) {
      this.form.controls.billingTriggers.setValidators(Validators.required);
      this.form.controls.pricingTriggers.setValidators(Validators.required);
    } else {
      this.form.controls.billingTriggers.setValidators(null);
      this.form.controls.pricingTriggers.setValidators(null);
    }

    this.form.controls.billingTriggers.updateValueAndValidity({ emitEvent: false });
    this.form.controls.pricingTriggers.updateValueAndValidity({ emitEvent: false });
  }

  private subscribeToActions(): void {
    this.actionSubj.pipe(
      ofType(actions.CreateBillingRuleSuccess, actions.UpdateBillingRuleSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.router.navigate(['..', action.billingRule.id], { relativeTo: this.route });
    });
  }

  public onCheck(controlName: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.form.get(controlName).patchValue(isChecked);
  }

  public onOutcomeBasedListChanged(outcomeBasedList: OutcomeBasedPricing[]): void {
    this.outcomeBasedPricings = [...outcomeBasedList];
  }

  public ngOnDestroy(): void {
    this.feeSplits = [];
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
