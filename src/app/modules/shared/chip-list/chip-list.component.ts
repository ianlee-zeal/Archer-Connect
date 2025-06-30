import { Component } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChipListOption } from '@app/models/chip-list-option';
import { BaseControlValueAccessor } from '../_abstractions/base-control-value-accessor';

/**
 * Used to display a list of options as a chip list
 *
 * Can be used inside of an Angular form as any standard HTML control,
 * value can be set with form.patchValue, later we can read the value with form.value
 *
 */
@Component({
  selector: 'app-chip-list',
  templateUrl: './chip-list.component.html',
  styleUrls: ['./chip-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: ChipListComponent,
    },
  ],
})
export class ChipListComponent extends BaseControlValueAccessor {
  public options: ChipListOption[];

  public writeValue(options: ChipListOption[]): void {
    this.options = options;
  }

  public onRemoveClicked(removedOption: ChipListOption): void {
    if (this.disabled) {
      return;
    }

    this.markAsTouched();
    this.options = this.options.filter(o => o.id !== removedOption.id);
    this.onChangeCallback(this.options);
  }
}
