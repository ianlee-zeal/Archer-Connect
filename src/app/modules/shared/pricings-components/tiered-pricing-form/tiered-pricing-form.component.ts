import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { TieredPricing } from '@app/models/billing-rule/tiered-pricing';
import { PriceInputValue } from '@app/modules/shared/price-input/price-input.component';
import { RangeInputValue } from '@app/modules/shared/range-input/range-input.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface TieredPricingFormValue {
  range: RangeInputValue;
  price: PriceInputValue;
}

@Component({
  selector: 'app-tiered-pricing-form',
  templateUrl: './tiered-pricing-form.component.html',
  styleUrls: ['./tiered-pricing-form.component.scss'],
})
export class TieredPricingFormComponent implements OnInit, OnDestroy {
  @Input() pricing: TieredPricing;
  @Output() public deleteClick: EventEmitter<any> = new EventEmitter();
  @Output() public pricingChange: EventEmitter<TieredPricing> = new EventEmitter();

  private ngUnsubscribe$ = new Subject<void>();

  public form: UntypedFormGroup = new UntypedFormGroup({
    range: new UntypedFormControl(null),
    price: new UntypedFormControl(null),
  });

  public ngOnInit(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((v: TieredPricingFormValue) => {
        const pricing: TieredPricing = {
          lowerValue: v.range?.lower || 0,
          upperValue: v.range?.upper || 0,
          tierPrice: v.price?.value,
          priceType: v.price?.type,
        };

        this.pricingChange.emit(pricing);
      });

    if (this.pricing) {
      const patch: TieredPricingFormValue = {
        range: { lower: this.pricing.lowerValue, upper: this.pricing.upperValue },
        price: { value: this.pricing.tierPrice, type: this.pricing.priceType },
      };

      this.form.patchValue(patch, { emitEvent: false });
      this.form.updateValueAndValidity({ emitEvent: false });
    }
  }

  public onDeleteClick(): void {
    this.deleteClick.emit();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
