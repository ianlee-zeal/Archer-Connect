import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { ActionsSubject, Store } from '@ngrx/store';
import * as fromShared from '@app/state';
import { ModalService, PermissionService, ServerErrorService, ToastService, ValidationService } from '@app/services';
import { Subject } from 'rxjs';
import { BillingRuleTemplate } from '@app/models/billing-rule/billing-rule-template';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { ofType } from '@ngrx/effects';
import { filter, takeUntil } from 'rxjs/operators';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ActivatedRoute, Router } from '@angular/router';
import * as pinnedPagesActions from '@app/modules/shared/state/pinned-pages/actions';
import { BillingRule } from '@app/models/billing-rule/billing-rule';
import { IdValue, Org, PinnedPage } from '@app/models';
import { FeeScopeEnum } from '@app/models/enums/billing-rule/fee-scope.enum';
import { RelatedServicesModalComponent } from '@app/modules/shared/entity-selection-modal/related-services-modal.component';
import { KeyValuePair } from '@app/models/utils';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { OrganizationSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/organization-selection-modal.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { OrgType } from '@app/models/enums/ledger-settings/org-type';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { BillingRuleRelatedService } from '@app/models/billing-rule/billing-rule-related-service';
import { ProductCategoryEnum } from '@app/models/enums/billing-rule/product-category.enum';
import { ChipListOption } from '@app/models/chip-list-option';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { BillingTrigger } from '@app/models/billing-rule/billing-trigger';
import { TriggerType, AutomatedTriggersIds } from '@app/models/enums/billing-rule/trigger-type.enum';
import { BillingRuleTriggerTiming } from '@app/models/enums/billing-rule/timing.enum';
import { GridId } from '@app/models/enums/grid-id.enum';
import { OutcomeBasedPricing } from '@app/models/billing-rule/outcome-based-pricing';
import { OutcomeBasedPricingDetails } from '@app/models/billing-rule/outcome-based-pricing-details';
import { VariablePricingFormValue } from '@app/modules/shared/variable-pricing-form/variable-pricing-form.component';
import { BillingRuleHelper, StringHelper, ArrayHelper } from '@app/helpers';
import { outcomeBasedPricingSelectors } from '@app/modules/shared/state/outcome-based-pricing/selectors';
import * as outcomeBasedPricingActions from '@app/modules/shared/state/outcome-based-pricing/actions';
import { BillingRuleRelatedServiceGridItem } from '@app/models/billing-rule/billing-rule-related-service-item';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-billing-rule-template-details',
  templateUrl: './billing-rule-template-details.component.html',
  styleUrls: ['./billing-rule-template-details.component.scss'],
})
export class BillingRuleTemplateDetailsComponent extends Editable implements OnInit, OnDestroy {
  public title: string;
  public billingRuleTemplateId: number;
  public billingRuleTemplateTitle: string;
  private isPinned: boolean;
  public billingRule: BillingRule;
  private relatedServicesOptions: ChipListOption[] = [];
  public relatedServices = [];
  private triggerTypes: IdValue[] = [];
  public billingTriggerDropdownOpts: SelectOption[] = [];
  public pricingTriggerDropdownOpts: SelectOption[] = [];
  public billingTriggersList: ChipListOption[] = [];
  public pricingTriggersList: ChipListOption[] = [];
  public gridId = GridId;
  public variablePricing: VariablePricingFormValue;
  public outcomeBasedScenarios = [];
  private isCreatingNewRecord: boolean;

  public editPermission = PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Edit);
  public createPermission = PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Create);
  public deletePermission = PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Delete);
  public statuses$ = this.store.select(selectors.statuses);
  public billingRuleTemplate$ = this.store.select(selectors.billingRuleTemplate);
  public feeScopes$ = this.store.select(selectors.feeScopes);
  public invoicingItems$ = this.store.select(selectors.invoicingItems);
  public revRecItems$ = this.store.select(selectors.revRecItems);
  public revRecMethods$ = this.store.select(selectors.revRecMethods);
  public chartOfAccounts$ = this.store.select(selectors.chartOfAccounts);
  public readonly triggerTypes$ = this.store.select(outcomeBasedPricingSelectors.triggerTypes);

  public existingBillingRuleTemplate: BillingRuleTemplate;

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<fromShared.AppState>,
    private actionsSubj: ActionsSubject,
    private serverErrorService: ServerErrorService,
    private permissionService: PermissionService,
    protected readonly router: Router,
    private readonly route: ActivatedRoute,
    private modalService: ModalService,
    private readonly toaster: ToastService,
  ) {
    super();
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    name: new UntypedFormControl(null, [Validators.required]),
    description: new UntypedFormControl(null, [Validators.maxLength(500)]),
    status: new UntypedFormControl(null),
    chartOfAccount: new UntypedFormControl(null),
    feeScope: new UntypedFormControl(null, [Validators.required]),
    invoicingItem: new UntypedFormControl(null),
    revRecItem: new UntypedFormControl(null),
    revRecMethod: new UntypedFormControl(null),

    maxFee: new UntypedFormControl(null, [ValidationService.onlyNumbersValidator]),
    maxFeePct: new UntypedFormControl(null, [ValidationService.onlyNumbersValidator]),
    maxFeeSwitcher: new UntypedFormControl(null),

    minFee: new UntypedFormControl(null, [ValidationService.onlyNumbersValidator]),
    minFeePct: new UntypedFormControl(null, [ValidationService.onlyNumbersValidator]),
    minFeeSwitcher: new UntypedFormControl(null),

    price: new UntypedFormControl(null, [ValidationService.onlyNumbersValidator]),
    pricePct: new UntypedFormControl(null, [ValidationService.onlyNumbersValidator]),
    priceSwitcher: new UntypedFormControl(null),

    isOutcomeBased: new UntypedFormControl(null),
    isVariable: new UntypedFormControl(null),

    relatedServices: new UntypedFormControl(null),
    outcomeBasedScenarios: new UntypedFormControl(null),
    isCollectorSpecific: new UntypedFormControl(null),
    collectorOrgName: new UntypedFormControl(null),
    collectorOrgId: new UntypedFormControl(null),

    relatedServiceRequired: new UntypedFormControl(true, [Validators.required]),
    iliAutoGeneration: new UntypedFormControl(false, [Validators.required]),
    billingTriggers: new UntypedFormControl([]),
    pricingTriggers: new UntypedFormControl([]),
  });

  public get isCollectorSpecific() {
    return BillingRuleHelper.isTrue(this.form, 'isCollectorSpecific');
  }

  public get isOutcomeBased() {
    return BillingRuleHelper.isTrue(this.form, 'isOutcomeBased');
  }

  public get isVariable() {
    return BillingRuleHelper.isTrue(this.form, 'isVariable');
  }

  public get maxFeeSwitcher() {
    return this.form.get('maxFeeSwitcher')?.value;
  }

  public get minFeeSwitcher() {
    return this.form.get('minFeeSwitcher')?.value;
  }

  public get priceSwitcher() {
    return this.form.get('priceSwitcher')?.value;
  }

  public get isRelatedServiceRequired() {
    return BillingRuleHelper.isTrue(this.form, 'relatedServiceRequired');
  }

  public get iliAutoGeneration() {
    return BillingRuleHelper.isTrue(this.form, 'iliAutoGeneration');
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get isFormValid(): boolean {
    return this.form.valid && this.isOutcomeBasedPricingValid() && this.isVariablePricingValid();
  }

  get hasChanges(): boolean {
    return this.form.dirty;
  }

  public get relatedServiceRequiredMessage(): string {
    const feeScope = this.form.get('feeScope')?.value?.id;
    return BillingRuleHelper.getRelatedServiceRequiredMessage(feeScope, this.isRelatedServiceRequired);
  }

  ngOnInit(): void {
    this.store.dispatch(actions.GetChartOfAccounts());
    this.store.dispatch(actions.GetFeeScopes());
    this.store.dispatch(actions.GetRevRecMethods());
    this.store.dispatch(outcomeBasedPricingActions.GetTriggerTypes());

    this.isCreatingNewRecord = StringHelper.equal(this.route.routeConfig.path, 'new');
    this.canEdit = this.isCreatingNewRecord || window.history.state.canEdit;

    const idFromUrl = +this.router.url.split('/').pop();
    if (!Number.isNaN(idFromUrl)) {
      this.billingRuleTemplateId = idFromUrl;
    }

    this.billingRuleTemplateTitle = this.billingRuleTemplateId ? 'Contract Rule Template Details' : 'Add New Contract Rule Template';

    this.subscribeToActions();
    this.subscribeToFormFields();
    this.subscribeToTriggerTypes();
    this.subscribeToBillingTriggersChange();
    this.subscribeToPricingTriggersChange();
    this.subscribeToFeeScopeChange();
    this.subscribeToIsRelatedServiceRequiredChange();
    this.subscribeToIsOutcomeBasedChange();
    this.subscribeToFormValueChange();

    if (this.billingRuleTemplateId) {
      this.subscribeToBillingRuleTemplate();
      this.getExistingBillingRuleTemplate();
    } else {
      this.subscribeToFeeScopes();
      this.subscribeToStatuses();
    }

    this.applyAutomatedTriggers();
  }

  public searchFn() {
    return true;
  }

  public searchInvoicingItems(term: string): void {
    this.store.dispatch(actions.SearchInvoicingItems({ searchTerm: term }));
  }

  public searchRevRecItems(term: string): void {
    this.store.dispatch(actions.SearchRevRecItems({ searchTerm: term }));
  }

  private initForm(brt: BillingRuleTemplate): void {
    const formInitializer = {
      name: brt.name,
      description: brt.description,
      status: brt.status,
      feeScope: brt.feeScope,
      chartOfAccount: brt.chartOfAccount,
      invoicingItem: brt.invoicingItem,
      revRecItem: brt.revRecItem,
      revRecMethod: brt.revRecMethod,
      maxFee: brt.maxFee,
      maxFeePct: brt.maxFeePct,
      maxFeeSwitcher: Boolean(brt.maxFeePct),
      minFee: brt.minFee,
      minFeePct: brt.minFeePct,
      minFeeSwitcher: Boolean(brt.minFeePct),
      price: brt.price,
      pricePct: brt.pricePct,
      priceSwitcher: Boolean(brt.pricePct),
      isOutcomeBased: brt.isOutcomeBased,
      isVariable: brt.isVariable,
      collectorOrgId: brt.collectorOrgId,
      collectorOrgName: brt.collectorOrg?.name,
      isCollectorSpecific: !!brt.collectorOrgId,
      relatedServiceRequired: brt.relatedServiceRequired,
      iliAutoGeneration: brt.iliAutoGeneration,
      billingTriggers: brt.billingTriggers
        .filter(trigger => trigger.timing === BillingRuleTriggerTiming.Billing)
        .map(ChipListOption.billingTriggerToModel),
      pricingTriggers: brt.billingTriggers
        .filter(trigger => trigger.timing === BillingRuleTriggerTiming.Pricing)
        .map(ChipListOption.billingTriggerToModel),
    };

    this.outcomeBasedScenarios = brt.outcomeBasedScenarios;

    if (brt.relatedServices.length) {
      this.relatedServicesOptions = brt.relatedServices.map(ChipListOption.serviceToModel);
      this.relatedServices = BillingRuleRelatedServiceGridItem.chipListToItems(this.relatedServicesOptions);
    }

    this.variablePricing = {
      tieredPricings: brt.details?.tieredPricings ?? [],
      percentageOfSavingsPricings: brt.details?.percentageOfSavingsPricings ?? [],
      slidingScalePricings: brt.details?.slidingScalePricings ?? [],
      variablePricingType: brt.variablePricingType,
      variablePricingTypeId: brt.variablePricingTypeId,
      defaultPrice: brt.details?.defaultPrice,
      defaultPriceType: brt.details?.defaultPriceType,
    };

    this.form.patchValue(formInitializer);
    this.applyAutomatedTriggers();
    this.form.updateValueAndValidity();
  }

  private subscribeToActions(): void {
    this.store.dispatch(actions.GetBillingRuleTemplateStatuses());

    this.actionsSubj.pipe(
      ofType(actions.Error),
      filter(action => typeof action.error !== 'string'),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(error => {
      this.serverErrorService.showServerErrors(this.form, error);
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.UpdateBillingRuleTemplateSuccess,
        actions.CreateBillingRuleTemplateSuccess,
      ),
    ).subscribe(() => {
      this.canEdit = false;
      this.isSavePerformed = true;
    });
  }

  private subscribeToBillingRuleTemplate(): void {
    this.billingRuleTemplate$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((brt: BillingRuleTemplate) => {
        this.existingBillingRuleTemplate = brt;
        this.isPinned = brt.isPinned;
        this.initForm(brt);
      });
  }

  private subscribeToFeeScopes(): void {
    this.feeScopes$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(items => {
        const defaultOpt = items.find(o => o.id === FeeScopeEnum.Project);
        this.form.controls.feeScope.setValue(defaultOpt, { emitEvent: false });
      });
  }

  private subscribeToStatuses(): void {
    this.statuses$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(items => {
        const defaultOpt = items.find(o => o.name === 'Active');
        this.form.controls.status.setValue(defaultOpt, { emitEvent: false });
      });
  }

  private getExistingBillingRuleTemplate(): void {
    this.store.dispatch(actions.GetBillingRuleTemplate({ id: this.billingRuleTemplateId }));
  }

  private goToBillingRulesList() {
    this.router.navigate(['admin', 'contract-rule-templates']);
  }

  private onCancel() {
    this.canEdit = false;
    if (this.existingBillingRuleTemplate) {
      this.initForm(this.existingBillingRuleTemplate);
    } else {
      this.goToBillingRulesList();
    }
  }

  public actionBarActionHandlers: ActionHandlersMap = {
    save: {
      callback: () => this.onSave(),
      disabled: () => !this.hasChanges || !this.isFormValid,
      hidden: () => !this.canEdit,
    },
    edit: { ...this.editAction() },
    back: {
      callback: () => this.goToBillingRulesList(),
      disabled: () => !this.canLeave,
    },
    cancel: {
      callback: () => this.onCancel(),
      hidden: () => !this.canEdit,
    },
    delete: {
      callback: () => this.onDelete(),
      hidden: () => !this.billingRuleTemplateId,
      permissions: PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Delete),
    },
    removePin: {
      callback: () => this.store.dispatch(pinnedPagesActions.RemovePinnedPage({
        entityId: this.billingRuleTemplateId,
        entityType: EntityTypeEnum.BillingRuleTemplate,
        callback: () => {
          this.isPinned = false;
        },
      })),
      hidden: () => !this.isPinned || !this.billingRuleTemplateId,
    },

    pinPage: {
      callback: () => this.store.dispatch(pinnedPagesActions.CreatePinnedPage({
        view: <PinnedPage> {
          entityId: this.billingRuleTemplateId,
          entityTypeId: EntityTypeEnum.BillingRuleTemplate,
          url: `admin/contract-rule-templates/${this.billingRuleTemplateId}`,
        },
        callback: () => {
          this.isPinned = true;
        },
      })),
      hidden: () => this.isPinned || !this.billingRuleTemplateId,
    },
  };

  public onSave(): void {
    if (!this.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }

    const value = this.form.value;
    const dto = {
      id: this.billingRuleTemplateId,
      name: value.name,
      description: value.description,
      feeScopeId: value.feeScope.id,
      chartOfAccountId: value.chartOfAccount?.id,
      revRecItemId: value?.revRecItem?.id,
      revRecMethodId: value?.revRecMethod?.id,
      invoicingItemId: value?.invoicingItem?.id,
      statusId: value.status?.id,
      collectorOrgId: value.collectorOrgId,
      relatedServices: [],
      maxFee: value.maxFee,
      maxFeePct: value.maxFeePct,
      minFee: value.minFee,
      minFeePct: value.minFeePct,
      price: value.price,
      pricePct: value.pricePct,
      isOutcomeBased: this.isOutcomeBased,
      outcomeBasedScenarios: this.outcomeBasedScenarios.map(OutcomeBasedPricing.toDto),
      isVariable: this.isVariable,
      details: OutcomeBasedPricingDetails.toDto(this.variablePricing),
      variablePricingTypeId: this.variablePricing?.variablePricingTypeId,
      relatedServiceRequired: this.isRelatedServiceRequired,
      iliAutoGeneration: this.iliAutoGeneration,
      billingTriggers: [
        ...value.billingTriggers.map(trigger => (
          <BillingTrigger>{
            timing: BillingRuleTriggerTiming.Billing,
            triggerTypeId: +trigger.id,
          }
        )),
        ...value.pricingTriggers.map(trigger => (
          <BillingTrigger>{
            timing: BillingRuleTriggerTiming.Pricing,
            triggerTypeId: +trigger.id,
          }
        )),
      ],
    };

    dto.relatedServices = this.relatedServices[0]?.serviceName === ProductCategoryEnum[ProductCategoryEnum.All]
      ? [{ productId: null, productCategoryId: ProductCategoryEnum.All }]
      : this.relatedServices.map(BillingRuleRelatedService.fromChipListOptionToDto);

    if (this.billingRuleTemplateId) {
      this.store.dispatch(actions.UpdateBillingRuleTemplate({ dto }));
    } else {
      this.store.dispatch(actions.CreateBillingRuleTemplate({ dto }));
    }
  }

  public onDelete(): void {
    this.store.dispatch(actions.DeleteBillingRuleTemplate({ id: this.billingRuleTemplateId }));
  }

  public onCheck(controlName: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.form.get(controlName).patchValue(isChecked);
    this.form.markAsDirty();
  }

  private subscribeToFormFields(): void {
    this.form.get('maxFeeSwitcher').valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(value => {
        if (!value) {
          this.form.get('maxFeePct').patchValue(null);
          this.form.get('maxFeePct').updateValueAndValidity();
        } else {
          this.form.get('maxFee').patchValue(null);
          this.form.get('maxFee').updateValueAndValidity();
        }
      });

    this.form.get('minFeeSwitcher').valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(value => {
        if (!value) {
          this.form.get('minFeePct').patchValue(null);
          this.form.get('minFeePct').updateValueAndValidity();
        } else {
          this.form.get('minFee').patchValue(null);
          this.form.get('minFee').updateValueAndValidity();
        }
      });

    this.form.get('priceSwitcher').valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(value => {
        if (!value) {
          this.form.get('pricePct').patchValue(null);
          this.form.get('pricePct').updateValueAndValidity();
        } else {
          this.form.get('price').patchValue(null);
          this.form.get('price').updateValueAndValidity();
        }
      });

    this.form.get('isCollectorSpecific').valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(value => {
        this.updateAutomatedTriggers(TriggerType.CollectorMatch, value);
        if (!value) {
          this.form.patchValue({ collectorOrgName: null, collectorOrgId: null });
          this.form.updateValueAndValidity();
          this.form.get('collectorOrgName').clearValidators();
        } else {
          this.form.get('collectorOrgName').setValidators([Validators.required]);
        }
        this.form.get('collectorOrgName').updateValueAndValidity();
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

  private subscribeToIsRelatedServiceRequiredChange(): void {
    this.form.controls.relatedServiceRequired.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((value: boolean) => {
        this.updateAutomatedTriggers(TriggerType.RelatedServiceMatch, value);
      });
  }

  private subscribeToIsOutcomeBasedChange(): void {
    this.form.controls.isOutcomeBased.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((value: boolean) => {
        this.updateAutomatedTriggers(TriggerType.OutcomeDetermined, value);
      });
  }

  private subscribeToFormValueChange(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(val => {
        this.setTriggersControlValidators(val);
      });
  }

  private setTriggersControlValidators(val): void {
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

  private applyAutomatedTriggers() {
    this.updateAutomatedTriggers(TriggerType.CollectorMatch, this.isCollectorSpecific);
    this.updateAutomatedTriggers(TriggerType.OutcomeDetermined, this.isOutcomeBased);
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
    this.form.markAsDirty();
  }

  public onBillingTriggersDropdownChange(billingTriggerOption: SelectOption): void {
    this.onTriggersChange(billingTriggerOption, 'billingTriggers');
  }

  public onPricingTriggersDropdownChange(pricingTriggerOption: SelectOption): void {
    this.onTriggersChange(pricingTriggerOption, 'pricingTriggers');
  }

  public onOpenRelatedServicesModal(): void {
    const selectedEntities: { key: string, value: string, selected: boolean }[] = this.relatedServices.map(service => ({
      key: service.id,
      value: `${service.serviceName} (${service.productName})`,
      selected: true,
    }));

    this.modalService.show(RelatedServicesModalComponent, {
      initialState: {
        selectedEntities,
        onEntitySelected: (entity: KeyValuePair<string, string>[]) => this.onServiceChanged(entity),
      },
      class: 'entity-selection-modal',
    });
  }

  public onOpenCollectorSearchModal(): void {
    this.modalService.show(OrganizationSelectionModalComponent, {
      initialState: {
        onEntitySelected: (org: Org) => {
          this.form.patchValue({ collectorOrgName: org.name, collectorOrgId: org.id });
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

  private onServiceChanged(services: KeyValuePair<string, string>[]): void {
    this.relatedServicesOptions = services.map(s => ({ id: s.key, name: s.value, isRemovable: true }));

    this.relatedServices = BillingRuleRelatedServiceGridItem.chipListToItems(this.relatedServicesOptions);
    this.form.controls.relatedServices.markAsDirty();
  }

  private subscribeToFeeScopeChange(): void {
    this.form.controls.feeScope.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((selectedFeeScope: IdValue) => {
        const control = this.form.get('relatedServiceRequired');
        BillingRuleHelper.updateIsRelatedServiceRequiredControl(control, selectedFeeScope);
      });
  }

  public onOutcomeBasedListChanged(outcomeBasedList: OutcomeBasedPricing[]): void {
    this.outcomeBasedScenarios = [...outcomeBasedList];
    if (outcomeBasedList.length > 0) {
      this.form.controls.outcomeBasedScenarios.markAsDirty();
    }
  }

  public isOutcomeBasedPricingValid(): boolean {
    return this.isOutcomeBased ? !!this.outcomeBasedScenarios?.length : true;
  }

  public isVariablePricingValid(): boolean {
    return this.isVariable ? !!this.variablePricing?.variablePricingTypeId : true;
  }

  public onClear(): void {
    this.form.patchValue({ collectorOrgName: null, collectorOrgId: null });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.ClearBillingRuleTemplate());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
