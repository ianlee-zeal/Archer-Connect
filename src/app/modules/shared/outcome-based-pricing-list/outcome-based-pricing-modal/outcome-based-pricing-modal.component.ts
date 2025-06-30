import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';

import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { OutcomeBasedPricing } from '@app/models/billing-rule/outcome-based-pricing';
import { VariablePricingType } from '@app/models/enums/billing-rule/variable-pricing-type';
import { IdValue } from '@app/models';
import { PriceInputValue } from '@app/modules/shared/price-input/price-input.component';
import { OutcomeBasedPricingDetails } from '@app/models/billing-rule/outcome-based-pricing-details';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { VariablePricingFormValue } from '@app/modules/shared/variable-pricing-form/variable-pricing-form.component';
import * as fromShared from '@shared/state';
import { ToggleState } from '../../../../models/enums/toggle-state.enum';

const { sharedActions, sharedSelectors } = fromShared;

export interface OutcomeBasedPricingModalFormValue {
  scenario: IdValue;
  variablePricingApplies: ToggleState;
  price: PriceInputValue;
}

@Component({
  selector: 'app-outcome-based-pricing-modal',
  templateUrl: './outcome-based-pricing-modal.component.html',
  styleUrls: ['./outcome-based-pricing-modal.component.scss'],
})
export class OutcomeBasedPricingModalComponent extends ValidationForm {
  // initial modal state ---
  public pricing: OutcomeBasedPricing;
  public tortId: number;
  public addHandler: (val: OutcomeBasedPricing) => void = () => {};
  // -----------------------

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

  public get validationForm(): UntypedFormGroup {
    return this.form;
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
      variablePricingType: this.variablePricing?.variablePricingType,
      price: val.price?.value,
      priceType: val.price?.type,
      details,
    };

    this.addHandler(pricing);
    this.modal.hide();
  }

  public onVariablePricingChange(val: VariablePricingFormValue): void {
    this.variablePricing = val;
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
