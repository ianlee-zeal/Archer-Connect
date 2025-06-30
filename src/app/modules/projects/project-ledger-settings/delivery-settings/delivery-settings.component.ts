import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { Store } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { LedgerSetttingsFormSections } from '@app/models/enums/ledger-settings/form-sections';
import { QSFType } from '@app/models/enums/ledger-settings/qsf-type';
import { ValidationForm } from '../../../shared/_abstractions/validation-form';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { LedgerSettingsState } from '../state/reducer';

@Component({
  selector: 'app-delivery-settings',
  templateUrl: './delivery-settings.component.html',
  styleUrls: ['./delivery-settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DeliverySettingsComponent extends ValidationForm implements OnInit {
  public ngUnsubscribe$ = new Subject<void>();
  public electronicDeliveryProviderOptions: SelectOption[] = [];
  public deliverySettings$ = this.store.select(selectors.deliverySettings);
  public readonly claimantSettlementLedgerSettingState$ = this.store.select(selectors.claimantSettlementLedgerSettingState);
  public readonly commonSettings$ = this.store.select(selectors.commonSettings);
  public deliverySettings;
  public form: UntypedFormGroup;
  public claimantSettlementLedgerSettingState: LedgerSettingsState;
  public qsfProductId;

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  @Output() formValid = new EventEmitter();
  @Output() formChanged = new EventEmitter();

  public readonly formFields = {
    electionFormRequired: 'electionFormRequired',
    closingStatementEnabledPostal: 'closingStatementEnabledPostal',
    closingStatementElectronicDeliveryEnabled: 'closingStatementElectronicDeliveryEnabled',
    closingStatementElectronicDeliveryProviderId: 'closingStatementElectronicDeliveryProviderId',
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

  loadSubscriptions() {
    this.deliverySettings$
      .pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.deliverySettings = item;
        this.electronicDeliveryProviderOptions = item.electronicDeliveryProviderOptions;
        this.setFormValues();
      });

    this.claimantSettlementLedgerSettingState$
      .pipe(
        filter(x => !!x),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(item => {
        this.claimantSettlementLedgerSettingState = item;
      });

    this.commonSettings$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$))
      .subscribe(value => {
        const isQsfGrossFirm = value.currentData.qsfProductId === QSFType.GrossToFirm;
        this.qsfProductId = value;
        if (isQsfGrossFirm && value.currentData.isQsfServiceChanged) {
          this.store.dispatch(actions.updateDeliverySettingsCurrentData({
            electionFormRequired: false,
            closingStatementElectronicDeliveryProviderId: null,
            closingStatementEnabledPostal: false,
            closingStatementElectronicDeliveryEnabled: false,
          }));
          const electronicDeliveryProvider = this.form.get(this.formFields.closingStatementElectronicDeliveryProviderId);
          electronicDeliveryProvider.setValidators(null);
          electronicDeliveryProvider.setValue(null);
          electronicDeliveryProvider.updateValueAndValidity({ onlySelf: true });
        }
      });
  }

  defaultLoad() {
    this.store.dispatch(actions.setDefaultDeliverySettings({ electronicDeliveryProviderOptions: this.electronicDeliveryProviderOptions }));
  }

  initForm(): void {
    this.form = this.fb.group({
      electionFormRequired: [false],
      closingStatementEnabledPostal: [false],
      closingStatementElectronicDeliveryEnabled: [false],
      closingStatementElectronicDeliveryProviderId: [null],
    });
  }

  checkedElectionFormRequired(): boolean {
    return this.claimantSettlementLedgerSettingState.data.claimSettlementLedgerSettings?.id ? this.deliverySettings.currentData.electionFormRequired : true;
  }

  setFormValues() {
    this.form.setValue({
      electionFormRequired: this.deliverySettings.currentData.electionFormRequired,
      closingStatementEnabledPostal: this.deliverySettings.currentData.closingStatementEnabledPostal,
      closingStatementElectronicDeliveryEnabled: this.deliverySettings.currentData.closingStatementElectronicDeliveryEnabled,
      closingStatementElectronicDeliveryProviderId: this.filterFromSelectOptions(this.deliverySettings.electronicDeliveryProviderOptions, this.deliverySettings.currentData.closingStatementElectronicDeliveryProviderId),
    });
    this.setValidation();
  }

  filterFromSelectOptions(options: SelectOption[], id: number): SelectOption {
    if (!!options && options.length > 0) {
      const selectedOptions = options?.filter(i => i.id === id);
      const option: SelectOption = selectedOptions.length > 0 ? selectedOptions[0] : null;
      return option;
    }
    return null;
  }

  public onChanges(): void {
    const electionFormRequired: boolean = this.form.get(this.formFields.electionFormRequired).value;
    const closingStatementEnabledPostal: boolean = this.form.get(this.formFields.closingStatementEnabledPostal).value;
    const closingStatementElectronicDeliveryEnabled: boolean = this.form.get(this.formFields.closingStatementElectronicDeliveryEnabled).value;
    const closingStatementElectronicDeliveryProviderId: number = this.form.get(this.formFields.closingStatementElectronicDeliveryProviderId).value?.id ?? null;

    const electronicDeliveryProvider = this.form.get(this.formFields.closingStatementElectronicDeliveryProviderId);

    if (closingStatementElectronicDeliveryEnabled) {
      electronicDeliveryProvider.setValidators(Validators.required);
      electronicDeliveryProvider.setValue(electronicDeliveryProvider.value.id);
    } else {
      electronicDeliveryProvider.setValidators(null);
      electronicDeliveryProvider.setValue(null);
    }
    electronicDeliveryProvider.updateValueAndValidity({ onlySelf: true });

    this.store.dispatch(actions.updateDeliverySettingsCurrentData({
      electionFormRequired,
      closingStatementEnabledPostal,
      closingStatementElectronicDeliveryEnabled,
      closingStatementElectronicDeliveryProviderId,
    }));

    this.setValidation();
    this.formChanged.emit();
  }

  private setValidation() {
    this.formValid.emit({
      formId: LedgerSetttingsFormSections.DeliverySettings,
      valid: this.validate(),
    });
  }
}
