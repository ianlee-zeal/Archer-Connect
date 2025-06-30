import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, AbstractControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, distinctUntilChanged, debounceTime } from 'rxjs/operators';

import { EntityAddress } from '@app/models/entity-address';
import { DropdownHelper } from '@app/helpers/dropdown.helper';
import { addressTypesDropdownValues, statesDropdownValues, countriesDropdownValues } from '@app/state';
import { TypeAheadHelper } from '@app/helpers/type-ahead.helper';
import { AddressState, Country } from '@app/models';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { ValidationService } from '@app/services/validation.service';
import { autoFocusFieldAsyncValidator } from '@app/validators/auto-focus-field.validator';
import { oneOfFieldsIsRequired } from '@app/validators/one-of-fields-is-required.validator';
import * as fromShared from '../../state';

const { sharedActions } = fromShared;

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
})
export class AddressFormComponent extends ValidationForm implements OnInit, OnDestroy {
  @Input()
  public entityId: number;

  @Input()
  public entityTypeId: number;

  @Input()
  public address: EntityAddress;

  @Input()
  public canEdit: boolean;

  @Input()
  isPrimaryAddress: boolean;

  @Input()
  public showAddresseeAndAttnTo: boolean;

  @Input()
  public canViewAuditInfoPermission: string;

  stateSearch = (search$: Observable<string>) => TypeAheadHelper.search(this.states, search$);

  countrySearch = (search$: Observable<string>) => TypeAheadHelper.search(this.countries, search$);

  countryValidator = (control: AbstractControl) => TypeAheadHelper.getValidationError(control, this.countries);

  stateValidator = (control: AbstractControl) => TypeAheadHelper.getValidationError(control, this.states);

  public dateRangeForm: UntypedFormGroup = new UntypedFormGroup({
    from: new UntypedFormControl(null),
    to: new UntypedFormControl({ value: null, disabled: true }),
  });

  public form: UntypedFormGroup = new UntypedFormGroup({
    id: new UntypedFormControl(0),
    type: new UntypedFormControl(null),
    isPrimary: new UntypedFormControl(false),
    line1: new UntypedFormControl(null),
    line2: new UntypedFormControl(null, [Validators.maxLength(255), ValidationService.noWhitespaceBeforeTextValidator]),
    attnTo: new UntypedFormControl(null, [Validators.maxLength(255), ValidationService.noWhitespaceBeforeTextValidator]),
    addressee: new UntypedFormControl(null, [Validators.maxLength(255), ValidationService.noWhitespaceBeforeTextValidator]),
    range: this.dateRangeForm,
    country: new UntypedFormControl(null),
    countryName: new UntypedFormControl('', this.countryValidator),
    state: new UntypedFormControl(''),
    city: new UntypedFormControl(''),
    zip: new UntypedFormControl(''),
    isActive: new UntypedFormControl(true),
    isPartial: new UntypedFormControl(false),
  });

  public states: AddressState[] = [];

  public countries: Country[] = [];

  public addressTypesDropdownValues$ = this.store.select(addressTypesDropdownValues);

  public statesDropdownValues$ = this.store.select(statesDropdownValues);

  private ngUnsubscribe$ = new Subject<void>();

  public dropdownComparator = DropdownHelper.compareOptions;

  constructor(private store: Store<fromShared.AppState>) {
    super();
  }

  public ngOnInit(): void {
    this.initCollections();
    this.setRequiredFields();

    this.form.controls.isActive.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((value: boolean) => {
      if (value) {
        this.dateRangeForm.controls.to.disable();
        this.dateRangeForm.controls.to.patchValue(null);
      } else {
        this.dateRangeForm.controls.to.enable();
      }
      this.dateRangeForm.updateValueAndValidity();
    });

    if (this.address) {
      const isValid = this.canEdit ? this.form.valid : true;
      const isPristine = this.canEdit ? this.form.pristine : true;

      this.store.dispatch(
        sharedActions.addAddressActions.ChangeAddressFormValidators({ isAddressFormValid: isValid, isPristineAddressForm: isPristine }),
      );
    } else {
      const isValid = !this.canEdit;
      const isPristine = !this.canEdit;

      this.store.dispatch(
        sharedActions.addAddressActions.ChangeAddressFormValidators({ isAddressFormValid: isValid, isPristineAddressForm: isPristine }),
      );
    }

    this.form.controls.isPrimary.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(value => {
      const isActiveControl = this.form.controls.isActive as UntypedFormControl;
      if (!value) {
        isActiveControl.enable();
      } else {
        isActiveControl.disable();
        if (!isActiveControl.value) {
          isActiveControl.patchValue(true, { onlySelf: true, emitEvent: false });
        }
      }
    });

    this.form.controls.isPartial.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(value => {
        if (!value) {
          this.setRequiredFields();
        } else {
          this.setOneOfFieldsIsRequired();
        }
      });

    this.form.valueChanges
      .pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        debounceTime(100),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(() => this.onFormChange());

    this.setInitialFormState();
  }

  private initCollections() {
    this.store
      .select(statesDropdownValues)
      .pipe(
        filter(x => !!x),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(results => {
        this.states = <AddressState[]>results;
      });

    this.store
      .select(countriesDropdownValues)
      .pipe(
        filter(x => !!x),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(results => {
        // AC-833 temporary change to shown countries, because Validation services only allow for United States Country
        // this.countries = <Country[]>results;
        this.countries = <Country[]>results.filter((o: Country) => o.id === 236 || o.code === 'US' || o.name === 'United States');
      });
  }

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public onFormChange(): void {
    const address: EntityAddress = {
      ...this.form.getRawValue(),
      entityId: this.entityId,
      entityType: this.entityTypeId,
      lastVerifiedDateTime: (this.address) && (this.address.id > 0) ? this.address.lastVerifiedDateTime : null,
      isActive: this.form.get('isPrimary').value === true ? true : this.form.get('isActive').value,
    };

    this.store.dispatch(sharedActions.addAddressActions.ChangeAddress({ address, isAddressFormValid: this.form.valid, isPristineAddressForm: this.form.pristine }));
  }

  public onCountryChange(event): void {
    const search = event.srcElement.value;
    this.patchCountry(search);
  }

  public onCountrySelected(event): void {
    const search = event.item;
    this.patchCountry(search);
  }

  public patchCountry(search): void {
    const country = TypeAheadHelper.get(this.countries, search.toLowerCase());

    this.form.patchValue({
      countryName: country ? country.name : search,
      country,
    });
  }

  private setRequiredFields(): void {
    const { type, line1, state, city, zip } = this.form.controls;
    const controls = [type, line1, state, city, zip];

    type.setValidators(Validators.required);
    line1.setValidators([Validators.maxLength(255), ValidationService.requiredAndNoWhitespaceBeforeTextValidator]);
    line1.setAsyncValidators(autoFocusFieldAsyncValidator);
    state.setValidators([Validators.required, Validators.maxLength(100), ValidationService.onlyAlphabetics, ValidationService.noWhitespaceBeforeTextValidator]);
    city.setValidators([Validators.required, Validators.maxLength(60)]);
    zip.setValidators([Validators.maxLength(20), ValidationService.zipCodeValidator]);

    this.form.setValidators(null);
    this.updateValueAndValidity(controls);
  }

  private setInitialFormState(): void {
    const { isPrimary } = this.form.controls;
    if (this.isPrimaryAddress) {
      isPrimary.setValue(true);
      isPrimary.disable();
    }
  }

  private setOneOfFieldsIsRequired(): void {
    const { type, line1, state, city, zip } = this.form.controls;
    const controls = [type, line1, state, city, zip];

    type.setValidators(null);
    line1.setAsyncValidators(null);
    line1.setValidators([Validators.maxLength(255), ValidationService.requiredAndNoWhitespaceBeforeTextValidator]);
    state.setValidators([Validators.maxLength(100), ValidationService.onlyAlphabetics, ValidationService.noWhitespaceBeforeTextValidator]);
    city.setValidators(Validators.maxLength(60));
    zip.setValidators([Validators.maxLength(20), ValidationService.zipCodeValidator]);

    this.form.setValidators(oneOfFieldsIsRequired(controls));
    this.updateValueAndValidity(controls);
  }

  private updateValueAndValidity(controls: AbstractControl[]): void {
    controls.forEach(control => {
      control.updateValueAndValidity();
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
