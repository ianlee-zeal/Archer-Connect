import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import { VariablePricingType } from '@app/models/enums/billing-rule/variable-pricing-type';
import { PriceType } from '@app/models/enums/billing-rule/price-type.enum';
import { OutcomeBasedPricingDetails } from '@app/models/billing-rule/outcome-based-pricing-details';
import { FormatService } from '@app/modules/projects/billing-rule/services/format.service';

@Component({
  selector: 'app-outcome-based-pricing-details',
  templateUrl: './pricing-details.component.html',
})
export class OutcomeBasedPricingDetailsComponent {
  @Input() variablePricingType: VariablePricingType;
  @Input() details: OutcomeBasedPricingDetails;

  public variablePricingTypeEnum = VariablePricingType;
  public priceTypeEnum = PriceType;

  constructor(
    public store: Store<any>,
    public format: FormatService,
  ) {
  }
}
