import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { CommonHelper } from '@app/helpers';
import { SelectOption } from '../_abstractions/base-select';

@Component({
  selector: 'app-clearable-input',
  templateUrl: './clearable-input.component.html',
  styleUrls: ['./clearable-input.component.scss'],
})
export class ClearableInputComponent {
  @Input() id: string;
  @Input() form: UntypedFormGroup;
  @Input() controlName: string;
  @Input() isReadonly: boolean;
  @Input() placeholder: string;
  @Input() width: number;
  @Input() marginRight: number;
  @Input() rating: SelectOption;
  @Input()

  public get ratingTitle(): string {
    return `Satisfaction Rating: ${this.rating?.name}`;
  }

  public get cursorPointer() {
    return this.isCursorPointer;
  }

  public set cursorPointer(value: any) {
    this.isCursorPointer = CommonHelper.setShortBooleanProperty(value);
  }

  private isCursorPointer: boolean;

  @Input() className: string = '';

  @Output() clear: EventEmitter<any> = new EventEmitter();

  onClear(event: MouseEvent) {
    event.stopPropagation();
    const control: AbstractControl = this.form.get(this.controlName);
    control.markAsTouched();
    control.markAsDirty();
    this.clear.emit();
  }
}
