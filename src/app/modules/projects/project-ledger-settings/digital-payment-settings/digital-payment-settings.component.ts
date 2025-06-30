import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LedgerSetttingsFormSections } from '@app/models/enums/ledger-settings/form-sections';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ValidationForm } from '../../../shared/_abstractions/validation-form';
import * as actions from '../state/actions';
import { LedgerSettingsState } from '../state/reducer';
import * as selectors from '../state/selectors';

@Component({
  selector: 'app-digital-payment-settings',
  templateUrl: './digital-payment-settings.component.html',
  styleUrls: ['./digital-payment-settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DigitalPaymentSettingsComponent extends ValidationForm implements OnInit {
  public ngUnsubscribe$ = new Subject<void>();
  public digitalPaymentProviderOptions: SelectOption[] = [];
  public digitalPaymentSettings$ = this.store.select(selectors.digitalPaymentSettings);
  public readonly claimantSettlementLedgerSettingState$ = this.store.select(selectors.claimantSettlementLedgerSettingState);
  public readonly commonSettings$ = this.store.select(selectors.commonSettings);
  public digitalPaymentSettings;
  public form: UntypedFormGroup;
  public claimantSettlementLedgerSettingState: LedgerSettingsState;

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  @Output() formValid = new EventEmitter();
  @Output() formChanged = new EventEmitter();

  public readonly formFields = {
    isDigitalPaymentsEnabled: 'isDigitalPaymentsEnabled',
    digitalPaymentProviderId: 'digitalPaymentProviderId',
  };

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly store: Store<LedgerSettingsState>,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadSubscriptions();
    this.defaultLoad();
  }

  loadSubscriptions(): void {
    this.digitalPaymentSettings$
      // eslint-disable-next-line @typescript-eslint/typedef
      .pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$))
      // eslint-disable-next-line @typescript-eslint/typedef
      .subscribe(item => {
        this.digitalPaymentSettings = item;
        this.digitalPaymentProviderOptions = item.digitalPaymentProvidersOptions;
        this.setFormValues();
      });

    this.claimantSettlementLedgerSettingState$
      .pipe(
        filter((x: LedgerSettingsState) => !!x),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((item: LedgerSettingsState) => {
        this.claimantSettlementLedgerSettingState = item;
      });
  }

  defaultLoad(): void {
    this.store.dispatch(actions.setDefaultDigitalPaymentsSettings({ digitalPaymentProvidersOptions: this.digitalPaymentProviderOptions }));
  }

  initForm(): void {
    this.form = this.fb.group({
      isDigitalPaymentsEnabled: [false],
      digitalPaymentProviderId: [null],
    });
  }

  checkedElectionFormRequired(): boolean {
    return this.claimantSettlementLedgerSettingState.data.claimSettlementLedgerSettings?.id ? this.digitalPaymentSettings.currentData.electionFormRequired : true;
  }

  setFormValues(): void {
    this.form.setValue({
      isDigitalPaymentsEnabled: this.digitalPaymentSettings.currentData.isDigitalPaymentsEnabled,
      digitalPaymentProviderId: this.filterFromSelectOptions(this.digitalPaymentSettings.digitalPaymentProvidersOptions, this.digitalPaymentSettings.currentData.digitalPaymentProviderId),
    });
    this.setValidation();
  }

  filterFromSelectOptions(options: SelectOption[], id: number): SelectOption {
    if (!!options && options.length > 0) {
      const selectedOptions = options?.filter((i: SelectOption) => i.id === id);
      const option: SelectOption = selectedOptions.length > 0 ? selectedOptions[0] : null;
      return option;
    }
    return null;
  }

  public onChanges(): void {
    const isDigitalPaymentsEnabled: boolean = this.form.get(this.formFields.isDigitalPaymentsEnabled).value;
    const digitalPaymentProviderField = this.form.get(this.formFields.digitalPaymentProviderId);

    if (isDigitalPaymentsEnabled) {
      digitalPaymentProviderField.setValidators(Validators.required);
    } else {
      digitalPaymentProviderField.setValidators(null);
      digitalPaymentProviderField.setValue(null);
    }
    digitalPaymentProviderField.updateValueAndValidity({ onlySelf: true });
    const digitalPaymentProviderId: number = this.form.get(this.formFields.digitalPaymentProviderId).value?.id ?? null;

    this.store.dispatch(actions.updateDigitalPaymentsSettingsCurrentData({
      isDigitalPaymentsEnabled,
      digitalPaymentProviderId,
    }));

    this.setValidation();
    this.formChanged.emit();
  }

  private setValidation(): void {
    this.formValid.emit({
      formId: LedgerSetttingsFormSections.DigitalPaymentSettings,
      valid: this.validate(),
    });
  }
}
