import { Component } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IdValue } from '@app/models';
import { PriceType } from '@app/models/enums/billing-rule/price-type.enum';
import { BaseControlValueAccessor } from '@app/modules/shared/_abstractions/base-control-value-accessor';

@Component({
  selector: 'app-price-type-toggle',
  templateUrl: './price-type-toggle.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: PriceTypeToggleComponent,
    },
  ],
})
export class PriceTypeToggleComponent extends BaseControlValueAccessor {
  public selectedOption: IdValue = null;

  public readonly options: IdValue[] = [
    { id: PriceType.Amount, name: '$' },
    { id: PriceType.Percentage, name: '%' },
  ];

  public writeValue(val: PriceType): void {
    this.selectedOption = this.options.find(o => o.id === val) ?? null;
  }

  public onToggleChange(opt: IdValue): void {
    if (this.disabled) {
      return;
    }

    this.markAsTouched();
    this.selectedOption = opt;

    if (opt) {
      this.onChangeCallback(opt.id);
    } else {
      this.onChangeCallback(null);
    }
  }
}
