/* eslint-disable no-param-reassign */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PriceType } from '@app/models/enums/billing-rule/price-type.enum';
import { BaseControlValueAccessor } from '@app/modules/shared/_abstractions/base-control-value-accessor';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class PriceInputValue {
  value: number | null;
  type: PriceType;

  constructor(value: number, type: PriceType) {
    this.value = value;
    this.type = type;
  }
}

@Component({
  selector: 'app-price-input',
  templateUrl: './price-input.component.html',
  styleUrls: ['./price-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: PriceInputComponent,
    },
  ],
})
export class PriceInputComponent extends BaseControlValueAccessor implements OnInit, OnDestroy {
  @Input() public placeholder: string = '';
  @Input() public setPriceToZeroIfValueIsEmpty: boolean = true;

  private ngUnsubscribe$ = new Subject<void>();

  public form: UntypedFormGroup = new UntypedFormGroup({
    value: new UntypedFormControl(null),
    type: new UntypedFormControl(PriceType.Amount),
  });

  public ngOnInit(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((val: PriceInputValue) => {
        // need to convert to a number explicitly, because the input is text by default
        val.value = val.value ? Number(val.value) : null;
        this.onInput(val);
      });
  }

  public writeValue(val: PriceInputValue): void {
    if (val) {
      this.form.patchValue(val);
      this.form.updateValueAndValidity();
    }
  }

  public onInput(val: PriceInputValue): void {
    if (this.disabled) {
      return;
    }

    this.markAsTouched();
    this.onChangeCallback(val);
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
