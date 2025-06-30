import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';

import { Subject } from 'rxjs';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { VariablePricingType } from '@app/models/enums/billing-rule/variable-pricing-type';
import { TieredPricing } from '@app/models/billing-rule/tiered-pricing';
import { PriceType } from '@app/models/enums/billing-rule/price-type.enum';
import { SlidingScalePricing } from '@app/models/billing-rule/sliding-scale-pricing';
import { PercentageOfSavingsPricing } from '@app/models/billing-rule/percentage-of-savings-pricing';
import { IdValue } from '@app/models';
import { takeUntil } from 'rxjs/operators';
import { PriceInputValue } from '@app/modules/shared/price-input/price-input.component';

export interface VariablePricingFormValue {
  tieredPricings: TieredPricing[];
  slidingScalePricings: SlidingScalePricing[];
  percentageOfSavingsPricings: PercentageOfSavingsPricing[];
  variablePricingType: IdValue;
  variablePricingTypeId?: number;
  defaultPrice: number;
  defaultPriceType: PriceType;
}

@Component({
  selector: 'app-variable-pricing-form',
  templateUrl: './variable-pricing-form.component.html',
  styleUrls: ['./variable-pricing-form.component.scss'],
})
export class VariablePricingFormComponent implements OnInit, OnDestroy {
  @Input() value: VariablePricingFormValue;
  @Input() variablePricingTypes: IdValue[];
  @Input() tortId: number;

  @Output() valueChange: EventEmitter<VariablePricingFormValue> = new EventEmitter();
  @Output() initFinished = new EventEmitter();

  private ngUnsubscribe$ = new Subject<void>();

  public readonly variablePricingTypeEnum = VariablePricingType;

  public tieredPricings: TieredPricing[] = [];
  public slidingScalePricings: SlidingScalePricing[] = [];
  public percentageOfSavingsPricings: PercentageOfSavingsPricing[] = [];
  public form: UntypedFormGroup = new UntypedFormGroup({
    variablePricingType: new UntypedFormControl(null),
    defaultPrice: new UntypedFormControl(new PriceInputValue(null, PriceType.Amount)),
  });

  constructor(
    public store: Store<any>,
  ) {
  }

  public ngOnInit(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.onValueChange();
      });

    if (this.value) {
      this.initValuesForEditing();
    }

    this.initFinished.emit();
  }

  public onChangePercentageOfSavingsPricing(pricing: PercentageOfSavingsPricing, index: number): void {
    Object.assign(this.percentageOfSavingsPricings[index], pricing);
    this.onValueChange();
  }

  public onDeletePercentageOfSavingsPricing(index: number): void {
    this.percentageOfSavingsPricings.splice(index, 1);
    this.onValueChange();
  }

  public onChangeTieredPricing(pricing: TieredPricing, index: number): void {
    Object.assign(this.tieredPricings[index], pricing);
    this.onValueChange();
  }

  public onDeleteTieredPricing(index: number): void {
    this.tieredPricings.splice(index, 1);
    this.onValueChange();
  }

  public onChangeSlidingScalePricing(pricing: SlidingScalePricing, index: number): void {
    Object.assign(this.slidingScalePricings[index], pricing);
    this.onValueChange();
  }

  public onDeleteSlidingScalePricing(index: number): void {
    this.slidingScalePricings.splice(index, 1);
    this.onValueChange();
  }

  public onAddPricing(): void {
    switch (this.form.value.variablePricingType?.id) {
      case VariablePricingType.PercentageOfSavings:
        this.percentageOfSavingsPricings.push({ percentageOfSavings: null });
        break;
      case VariablePricingType.SlidingScale:
        this.slidingScalePricings = [...this.slidingScalePricings, {
          injuryCategories: [] ,
          lowerValue: null,
          priceType: PriceType.Amount,
          tierPrice: null,
          upperValue: null,
        }];
        break;
      case VariablePricingType.TieredPrice:
        this.tieredPricings = [...this.tieredPricings, {
          lowerValue: null,
          upperValue: null,
          priceType: PriceType.Amount,
          tierPrice: null,
        }];
        break;
      default:
        break;
    }

    this.onValueChange();
  }

  private initValuesForEditing(): void {
    const patch = {
      variablePricingType: this.value.variablePricingType,
      defaultPrice: { value: this.value.defaultPrice, type: this.value.defaultPriceType },
    };

    this.tieredPricings = this.value.tieredPricings ?? [];
    this.slidingScalePricings = this.value.slidingScalePricings ?? [];
    this.percentageOfSavingsPricings = this.value.percentageOfSavingsPricings ?? [];

    this.form.patchValue(patch, { emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  private onValueChange(): void {
    const val: VariablePricingFormValue = {
      defaultPrice: this.form.value.defaultPrice?.value,
      defaultPriceType: this.form.value.defaultPrice?.type,
      variablePricingType: this.form.value.variablePricingType,
      percentageOfSavingsPricings: this.percentageOfSavingsPricings,
      slidingScalePricings: this.slidingScalePricings,
      tieredPricings: this.tieredPricings,
    };

    this.valueChange.emit(val);
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
