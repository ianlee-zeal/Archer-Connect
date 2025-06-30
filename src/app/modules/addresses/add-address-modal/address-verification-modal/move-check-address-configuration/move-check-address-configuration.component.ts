import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import * as fromShared from '../../../state';
import { AddressVerificationModalState } from '../state/reducer';
import { DropdownHelper } from '@app/helpers/dropdown.helper';
import { AddressMoveCheckConfiguration } from '@app/models/address';
import { IdValue } from '@app/models';
import { SelectHelper } from '@app/helpers/select.helper';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
const { sharedSelectors, sharedActions } = fromShared;

@Component({
  selector: 'app-move-check-address-configuration',
  templateUrl: './move-check-address-configuration.component.html',
  styleUrls: ['./move-check-address-configuration.component.scss'],
})
export class MoveCheckAddressConfigurationComponent implements OnInit, OnDestroy {
  protected ngUnsubscribe$ = new Subject<void>();
  public form: UntypedFormGroup;

  public moveCheckMonthsRequested: SelectOption[] = [];
  private monthsRequested: IdValue[] = [];
  public dropdownComparator = DropdownHelper.compareOptions;

  public config$ = this.store.select(sharedSelectors.addressVerificationModalSelectors.moveCheckConfiguration);

  constructor(private store: Store<AddressVerificationModalState>) {}

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  ngOnInit() {
    this.form = new UntypedFormGroup({
      monthsRequested: new UntypedFormControl('', Validators.required),
    });

    this.store
      .select(sharedSelectors.addressVerificationModalSelectors.dropdownValues)
      .pipe(
        filter(x => !!x),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(result => {
        this.monthsRequested = result.moveCheckMonthsRequested;
        this.moveCheckMonthsRequested = SelectHelper.toOptions(result.moveCheckMonthsRequested, option => option.id, option => 'Last ' + option.name + ' Months');
      });
  }

  public onChange(id): void {
    this.form.patchValue({
      monthsRequested: this.monthsRequested.find(o => o.id == id)
    })

    let config: AddressMoveCheckConfiguration = {
      ...this.form.getRawValue()
    };

    this.store.dispatch(sharedActions.addressVerificationActions.ChangeMoveCheckConfiguration({ moveCheckConfiguration: config }));
  }
}
