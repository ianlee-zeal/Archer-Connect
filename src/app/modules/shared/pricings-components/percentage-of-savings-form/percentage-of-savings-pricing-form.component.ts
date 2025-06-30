import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { PercentageOfSavingsPricing } from '@app/models/billing-rule/percentage-of-savings-pricing';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface PercentageOfSavingsPricingFormValue {
  percentageOfSavings: number;
}

@Component({
  selector: 'app-percentage-of-savings-pricing-form',
  templateUrl: './percentage-of-savings-pricing-form.component.html',
  styleUrls: ['./percentage-of-savings-pricing-form.component.scss'],
})
export class PercentageOfSavingsPricingFormComponent implements OnInit, OnDestroy {
  @Input() pricing: PercentageOfSavingsPricing;
  @Output() public deleteClick: EventEmitter<any> = new EventEmitter();
  @Output() public pricingChange: EventEmitter<PercentageOfSavingsPricingFormValue> = new EventEmitter();

  private ngUnsubscribe$ = new Subject<void>();

  public form: UntypedFormGroup = new UntypedFormGroup({ percentageOfSavings: new UntypedFormControl(null) });

  public ngOnInit(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(v => {
        this.pricingChange.emit(v);
      });

    if (this.pricing) {
      this.form.patchValue(this.pricing, { emitEvent: false });
      this.form.updateValueAndValidity({ emitEvent: false });
    }
  }

  public onDeleteClick(): void {
    this.deleteClick.emit();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
