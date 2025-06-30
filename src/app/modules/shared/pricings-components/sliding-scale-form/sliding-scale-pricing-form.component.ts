import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { InjuryCategory } from '@app/models';
import { SlidingScalePricing } from '@app/models/billing-rule/sliding-scale-pricing';
import { PriceInputValue } from '@app/modules/shared/price-input/price-input.component';
import { RangeInputValue } from '@app/modules/shared/range-input/range-input.component';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as selectors from '../../state/pricing-components/selectors';
import * as actions from '../../state/pricing-components/actions';

export interface SlidingScalePricingFormValue {
  range: RangeInputValue,
  price: PriceInputValue,
  injuryCategories: InjuryCategory[],
}

@Component({
  selector: 'app-sliding-scale-pricing-form',
  templateUrl: './sliding-scale-pricing-form.component.html',
  styleUrls: ['./sliding-scale-pricing-form.component.scss'],
})
export class SlidingScalePricingFormComponent implements OnInit, OnDestroy {
  @Input() pricing: SlidingScalePricing;
  @Input() tortId: number;
  @Output() public deleteClick: EventEmitter<any> = new EventEmitter();
  @Output() public pricingChange: EventEmitter<SlidingScalePricing> = new EventEmitter();

  private ngUnsubscribe$ = new Subject<void>();

  public injuryCategories$ = this.store.select(selectors.pricingComponentsSelectors.injuryCategories);

  public form: UntypedFormGroup = new UntypedFormGroup({
    range: new UntypedFormControl(null),
    price: new UntypedFormControl(null),
    injuryCategories: new UntypedFormControl([]),
  });

  constructor(private store: Store<any>) {}

  public ngOnInit(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((v: SlidingScalePricingFormValue) => {
        const pricing: SlidingScalePricing = {
          injuryCategories: v.injuryCategories,
          lowerValue: v.range?.lower || 0,
          priceType: v.price?.type,
          tierPrice: v.price?.value,
          upperValue: v.range?.upper || 0,
        };
        this.pricingChange.emit(pricing);
      });

    if (this.pricing) {
      const patch: SlidingScalePricingFormValue = {
        range: { lower: this.pricing.lowerValue, upper: this.pricing.upperValue },
        injuryCategories: this.pricing.injuryCategories,
        price: { type: this.pricing.priceType, value: this.pricing.tierPrice },
      };

      this.form.patchValue(patch, { emitEvent: false });
      this.form.updateValueAndValidity({ emitEvent: false });
    }
  }

  public searchFn = () => true;

  public onDeleteClick(): void {
    this.deleteClick.emit();
  }

  public onSearchInjuryCategory(term: string): void {
    this.store.dispatch(actions.SearchInjuryCategories({ term, tortId: this.tortId }));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
