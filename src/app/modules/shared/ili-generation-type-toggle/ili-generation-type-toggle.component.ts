import { Component } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IdValue } from '@app/models';
import { PriceType } from '@app/models/enums/billing-rule/price-type.enum';
import { ToggleState } from '@app/models/enums/toggle-state.enum';
import { BaseControlValueAccessor } from '@app/modules/shared/_abstractions/base-control-value-accessor';

@Component({
  selector: 'app-ili-generation-type-toggle',
  templateUrl: './ili-generation-type-toggle.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: ILIGenerationTypeToggleComponent,
    },
  ],
})
export class ILIGenerationTypeToggleComponent extends BaseControlValueAccessor {
  public selectedOption: IdValue = null;

  public readonly options: IdValue[] = [
    { id: ToggleState.Manual, name: 'Manual' },
    { id: ToggleState.Automated, name: 'Automated' },
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

    this.onChangeCallback(opt ? opt.id : null);
  }
}
