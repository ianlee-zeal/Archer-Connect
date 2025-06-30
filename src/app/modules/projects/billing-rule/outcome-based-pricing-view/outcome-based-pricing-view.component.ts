import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import { OutcomeBasedPricing } from '@app/models/billing-rule/outcome-based-pricing';
import { VariablePricingType } from '@app/models/enums/billing-rule/variable-pricing-type';
import { PriceType } from '@app/models/enums/billing-rule/price-type.enum';
import { FormatService } from '../services/format.service';

@Component({
  selector: 'app-outcome-based-pricing-view',
  templateUrl: './outcome-based-pricing-view.component.html',
  styleUrls: ['./outcome-based-pricing-view.component.scss'],
})
export class OutcomeBasedPricingViewComponent {
  @Input() outcomeBasedPricings: OutcomeBasedPricing[];

  public variablePricingTypeEnum = VariablePricingType;
  public priceTypeEnum = PriceType;

  constructor(
    public store: Store<any>,
    public format: FormatService,
  ) {
  }
}
