import { Component } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IdValue } from '@app/models';
import { ToggleState } from '@app/models/enums/toggle-state.enum';
import { BaseControlValueAccessor } from '@app/modules/shared/_abstractions/base-control-value-accessor';

@Component({
  selector: 'app-yes-no-toggle',
  templateUrl: './yes-no-toggle.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: YesNoToggleComponent,
    },
  ],
  styleUrls: ['./yes-no-toggle.component.scss'],
})
export class YesNoToggleComponent extends BaseControlValueAccessor {
  public selectedOption: IdValue = null;

  public readonly options: IdValue[] = [
    { id: ToggleState.Yes, name: 'Yes' },
    { id: ToggleState.No, name: 'No' },
  ];

  public writeValue(val: ToggleState): void {
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
