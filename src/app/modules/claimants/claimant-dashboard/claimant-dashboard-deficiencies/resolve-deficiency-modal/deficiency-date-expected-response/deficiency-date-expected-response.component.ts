import { Component, EventEmitter, forwardRef, Output } from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { DateFormatPipe } from '@shared/_pipes';
import { DateValidator } from '@shared/_validators/date-validator';

const MAX_DATES = 5;

@Component({
  selector: 'app-deficiency-date-expected-response',
  templateUrl: './deficiency-date-expected-response.component.html',
  styleUrl: './deficiency-date-expected-response.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DeficiencyDateExpectedResponseComponent),
    multi: true
  }]
})

export class DeficiencyDateExpectedResponseComponent implements ControlValueAccessor {

  datesForm: FormGroup = this.fb.group({});

  private onChange: (_: any) => void = () => {};
  private onTouched: () => void = () => {};
  private inputDatesSubscription: Subscription;

  isValid: boolean = true;

  @Output() public isSubmitValid = new EventEmitter<boolean>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly dateValidator: DateValidator,
  ){
    this.datesForm = this.fb.group({
      inputDates: this.fb.array(
        [this.fb.control('', Validators.required)],
        { validators: [this.dateValidator.duplicateDatesValidator] }
      )
    });

    this.subscribeToInputDates();

  }

  private subscribeToInputDates(): void {
    if (this.inputDatesSubscription) {
      this.inputDatesSubscription.unsubscribe();
    }
    this.inputDatesSubscription = this.inputDates.valueChanges.subscribe((dates: Date[]) => {
      this.onChange(dates);
      this.updateSubmitValidity();
    });
  }

  get inputDates(): FormArray {
    return this.datesForm.get('inputDates') as FormArray;
  }

  get hasDuplicateDates(): boolean {
    return this.inputDates.errors?.duplicates === true;
  }

  public addDate(): void {
    if (this.inputDates.length < MAX_DATES && !this.hasDuplicateDates
      && this.inputDates.controls.every(ctrl => ctrl.valid)) {
        this.inputDates.push(this.fb.control('', Validators.required));
        this.isValid = true;
    }
  }

  validateValid(isValid: boolean): void {
    this.isValid = isValid;
    this.updateSubmitValidity();
  }

  removeDate(i: number) {
    this.inputDates.removeAt(i);
    this.isValid = true;
    this.updateSubmitValidity();
  }

  private updateSubmitValidity(): void {
    let isSubmitValid = this.isValid && !this.hasDuplicateDates && this.inputDates.valid;
    if (this.inputDates.controls.length === 1 && !this.inputDates.controls[0].value && this.isValid) { isSubmitValid = true; }
    this.isSubmitValid.emit(isSubmitValid);
  }

  writeValue(value: string[]): void {
    if (value && Array.isArray(value)) {
      const dateControls = value.map(date =>
        this.fb.control(date ? new Date(date) : '', Validators.required)
      );
      const newControl = this.fb.array(dateControls, { validators: [this.dateValidator.duplicateDatesValidator] });
      this.datesForm.setControl('inputDates', newControl);
      this.subscribeToInputDates();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  protected readonly MAX_DATES = MAX_DATES;
  protected readonly DateFormatPipe = DateFormatPipe;
}
