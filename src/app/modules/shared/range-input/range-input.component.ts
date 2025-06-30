import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControlValueAccessor } from '@app/modules/shared/_abstractions/base-control-value-accessor';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface RangeInputValue {
  lower: number;
  upper: number;
}

@Component({
  selector: 'app-range-input',
  templateUrl: './range-input.component.html',
  styleUrls: ['./range-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: RangeInputComponent,
    },
  ],
})
export class RangeInputComponent extends BaseControlValueAccessor implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  public form: UntypedFormGroup = new UntypedFormGroup({
    lower: new UntypedFormControl(null),
    upper: new UntypedFormControl(null),
  });

  public ngOnInit(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((val: RangeInputValue) => {
        this.onInput(val);
      });
  }

  public writeValue(val: RangeInputValue): void {
    if (val) {
      this.form.patchValue(val);
      this.form.updateValueAndValidity();
    }
  }

  public onInput(val: RangeInputValue): void {
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
