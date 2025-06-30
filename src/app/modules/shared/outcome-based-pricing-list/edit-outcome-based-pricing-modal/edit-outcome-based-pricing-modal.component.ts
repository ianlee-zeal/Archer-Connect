import { Component, OnDestroy, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';

import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { OutcomeBasedPricing } from '@app/models/billing-rule/outcome-based-pricing';
import { VariablePricingType } from '@app/models/enums/billing-rule/variable-pricing-type';
import { IdValue } from '@app/models';
import { PriceInputValue } from '@app/modules/shared/price-input/price-input.component';
import { OutcomeBasedPricingDetails } from '@app/models/billing-rule/outcome-based-pricing-details';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { Subject } from 'rxjs';
import { VariablePricingFormValue } from '@app/modules/shared/variable-pricing-form/variable-pricing-form.component';
import * as fromShared from '@shared/state';
import { ToggleState } from '../../../../models/enums/toggle-state.enum';
import { PriceType } from '@app/models/enums';

const { sharedActions, sharedSelectors } = fromShared;

export interface OutcomeBasedPricingModalFormValue {
  scenario: IdValue;
  variablePricingApplies: ToggleState;
  price: PriceInputValue;
}

@Component({
  selector: 'app-edit-outcome-based-pricing-modal',
  templateUrl: './edit-outcome-based-pricing-modal.component.html',
})
export class EditOutcomeBasedPricingModal extends ValidationForm implements OnInit, OnDestroy {
  public addHandler: (val: OutcomeBasedPricing) => void = () => {};
  private ngUnsubscribe$ = new Subject<void>();
  public pricing: OutcomeBasedPricing;
  public tortId: number;

  public readonly scenarios$ = this.store.select(sharedSelectors.outcomeBasedPricingSelectors.scenarios);
  public readonly variablePricingTypes$ = this.store.select(sharedSelectors.outcomeBasedPricingSelectors.variablePricingTypes);
  public readonly toggleStateEnum = ToggleState;
  public readonly variablePricingTypeEnum = VariablePricingType;
  public variablePricing: VariablePricingFormValue;

  public form: UntypedFormGroup = new UntypedFormGroup({
    scenario: new UntypedFormControl(null, [Validators.required]),
    variablePricingApplies: new UntypedFormControl(ToggleState.No, [Validators.required]),
    price: new UntypedFormControl(null),
  });

  constructor(
    public modal: BsModalRef,
    public store: Store<any>,
    public actionsSubj: ActionsSubject,
  ) {
    super();
  }

  ngOnDestroy(): void {
  }

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get saveBtnTitle(): string {
    return this.pricing != null ? 'Save' : 'Add';
  }

  public ngOnInit(): void {
    this.store.dispatch(sharedActions.outcomeBasedPricingActions.GetScenarios());
    this.store.dispatch(sharedActions.outcomeBasedPricingActions.GetVariablePricingTypes());

    if (this.pricing) {
      this.initValuesForEditing();
    }
  }

  public onAdd(): void {
    this.validate();

    if (this.form.invalid) {
      return;
    }

    const val: OutcomeBasedPricingModalFormValue = this.form.value;

    const details: OutcomeBasedPricingDetails = {
      defaultPrice: this.variablePricing?.defaultPrice,
      defaultPriceType: this.variablePricing?.defaultPriceType,
      percentageOfSavingsPricings: this.variablePricing?.percentageOfSavingsPricings,
      slidingScalePricings: this.variablePricing?.slidingScalePricings,
      tieredPricings: this.variablePricing?.tieredPricings,
    };

    const pricing: OutcomeBasedPricing = {
      id: this.pricing?.id,
      scenario: val.scenario,
      variablePricingApplies: val.variablePricingApplies === ToggleState.Yes,
      variablePricingType: val.variablePricingApplies === ToggleState.Yes ? this.variablePricing?.variablePricingType : null,
      price: val.price?.value ?? 0,
      priceType: val.price?.type ?? PriceType.Amount,
      details: val.variablePricingApplies === ToggleState.Yes ? details : null,
    };

    this.addHandler(pricing);
    this.modal.hide();
  }

  public onVariablePricingChange(val: VariablePricingFormValue): void {
    this.variablePricing = val;
    if (val.variablePricingType.id == 1) {
      this.variablePricing.slidingScalePricings = [];
      this.variablePricing.percentageOfSavingsPricings = [];
    } else if (val.variablePricingType.id == 2) {
      this.variablePricing.percentageOfSavingsPricings = [];
      this.variablePricing.tieredPricings = [];
    } else if (val.variablePricingType.id == 3) {
      this.variablePricing.tieredPricings = [];
      this.variablePricing.slidingScalePricings = [];
    }
  }

  private initValuesForEditing(): void {
    const patch: OutcomeBasedPricingModalFormValue = {
      scenario: this.pricing.scenario,
      variablePricingApplies: this.pricing.variablePricingApplies ? ToggleState.Yes : ToggleState.No,
      price: { value: this.pricing.price, type: this.pricing.priceType },
    };

    this.variablePricing = {
      defaultPrice: this.pricing.details?.defaultPrice,
      defaultPriceType: this.pricing.details?.defaultPriceType,
      percentageOfSavingsPricings: this.pricing.details?.percentageOfSavingsPricings,
      slidingScalePricings: this.pricing.details?.slidingScalePricings,
      tieredPricings: this.pricing.details?.tieredPricings,
      variablePricingType: this.pricing.variablePricingType,
    };

    this.form.patchValue(patch);
    this.form.updateValueAndValidity();
  }
}
