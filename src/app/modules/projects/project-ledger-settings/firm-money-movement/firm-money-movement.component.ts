import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { LedgerSetttingsFormSections } from '@app/models/enums/ledger-settings/form-sections';
import { FirmMoneyMovementDefaultValues } from '@app/services/firm-money-movement-default-values.service';
import { ValidationForm } from '../../../shared/_abstractions/validation-form';

import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { LedgerSettingsState } from '../state/reducer';

@Component({
  selector: 'app-firm-money-movement',
  templateUrl: './firm-money-movement.component.html',
  styleUrls: ['./firm-money-movement.component.scss'],
})
export class FirmMoneyMovementComponent extends ValidationForm implements OnInit {
  public ngUnsubscribe$ = new Subject<void>();

  public firmMoneyMovementOptions: SelectOption[] = [];
  public firmMoneyMovement$ = this.store.select(selectors.firmMoneyMovement);
  public firmMoneyMovement;
  public firmMoneyMovementValues;
  public commonSettings$ = this.store.select(selectors.commonSettings);
  public commonSettings;

  public form: UntypedFormGroup;

  @Output() formChanged = new EventEmitter();
  @Output() formValid = new EventEmitter();

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly store: Store<LedgerSettingsState>,
    private defaultValues: FirmMoneyMovementDefaultValues,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadSubscriptions();
  }

  loadSubscriptions() {
    this.commonSettings$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$))
      .subscribe(value => {
        this.commonSettings = value;
        if (value.currentData.isQsfServiceChanged) {
          this.firmMoneyMovementValues = this.defaultValues.updateDefaultValues(this.commonSettings.currentData.qsfProductId, this.firmMoneyMovement.currentData.specialInstructions);
          this.store.dispatch(actions.updateFirmMoneyMovementCurrentData({ firmMoneyMovementValues: this.firmMoneyMovementValues }));

          this.store.dispatch(actions.updateCommonSettingsCurrentData({
            currentData: {
              netAllocationThreshold: this.commonSettings.currentData.netAllocationThreshold,
              qsfProductId: this.commonSettings.currentData.qsfProductId,
              lienPaymentsOrganization: this.commonSettings.currentData.lienPaymentsOrganization,
              isQsfServiceChanged: false,
              defenseApprovalRequired: this.commonSettings.currentData.defenseApprovalRequired,
              multipleRoundsOfFunding: this.commonSettings.currentData.multipleRoundsOfFunding,
              enableLienTransfers: this.commonSettings.currentData.enableLienTransfers,
              isManualPaymentRequestsAllowed: this.commonSettings.currentData.isManualPaymentRequestsAllowed,
              isFeeAutomationEnabled: this.commonSettings.currentData.isFeeAutomationEnabled,
              isClosingStatementAutomationEnabled: this.commonSettings.currentData.isClosingStatementAutomationEnabled,
              isPaymentAutomationEnabled: this.commonSettings.currentData.isPaymentAutomationEnabled,
            },
          }));
        }
      });

    this.firmMoneyMovement$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.firmMoneyMovement = item;
        this.firmMoneyMovementOptions = this.firmMoneyMovement.firmMoneyMovementOptions;

        if (!this.firmMoneyMovement.currentData.settlementCounselPaymentOrgTypeId
            && !this.firmMoneyMovement.currentData.primaryFirmPaymentOrgTypeId
            && !this.firmMoneyMovement.currentData.referingFirmPaymentOrgTypeId) {
          this.firmMoneyMovementValues = this.defaultValues.updateDefaultValues(this.commonSettings.currentData.qsfProductId, this.firmMoneyMovement.currentData.specialInstructions);
          this.store.dispatch(actions.updateFirmMoneyMovementCurrentData({ firmMoneyMovementValues: this.firmMoneyMovementValues }));
        }

        this.setFormValues();
        this.setValidation();
      });

    // This is needed to emit "form changed" event when we type in the text field (special instructions),
    // and trigger validation in the parent component for enable the save button
    this.form.valueChanges
      .subscribe(() => {
        this.formChanged.emit();
      });
  }

  setFormValues() {
    this.form.setValue({
      settlementCounselPayments: this.firmMoneyMovement.currentData.settlementCounselPaymentOrgTypeId ? this.getOption(this.firmMoneyMovement.currentData.settlementCounselPaymentOrgTypeId) : null,
      primaryFirmPayments: this.firmMoneyMovement.currentData.primaryFirmPaymentOrgTypeId ? this.getOption(this.firmMoneyMovement.currentData.primaryFirmPaymentOrgTypeId) : null,
      referingFirmPayments: this.firmMoneyMovement.currentData.referingFirmPaymentOrgTypeId ? this.getOption(this.firmMoneyMovement.currentData.referingFirmPaymentOrgTypeId) : null,
      specialInstructions: this.firmMoneyMovement.currentData.specialInstructions ? this.firmMoneyMovement.currentData.specialInstructions : null,
    });
  }

  getOption(optionId: number): SelectOption {
    const selectedOptions = this.firmMoneyMovementOptions.filter(i => i.id === optionId);
    const option: SelectOption = selectedOptions.length > 0 ? selectedOptions[0] : null;
    return option;
  }

  initForm(): void {
    this.form = this.fb.group({
      settlementCounselPayments: [null, Validators.required],
      primaryFirmPayments: [null, Validators.required],
      referingFirmPayments: [null, Validators.required],
      specialInstructions: ['', Validators.maxLength(500)],
    });
  }

  public onChanges(): void {
    this.updateState();
    this.setValidation();
    this.formChanged.emit();
  }

  private updateState() {
    if (!this.form.valid) {
      return;
    }
    const firmMoneyMovementValues = {
      primaryFirmPayments: this.form.value.primaryFirmPayments.id,
      referingFirmPayments: this.form.value.referingFirmPayments.id,
      settlementCounselPayments: this.form.value.settlementCounselPayments.id,
      specialInstructions: this.form.value.specialInstructions,
    };

    this.store.dispatch(actions.updateFirmMoneyMovementCurrentData({ firmMoneyMovementValues }));
    this.store.dispatch(actions.updateCommonSettingsCurrentData({
      currentData: {
        netAllocationThreshold: this.commonSettings.currentData.netAllocationThreshold,
        qsfProductId: this.commonSettings.currentData.qsfProductId,
        isQsfServiceChanged: false,
        lienPaymentsOrganization: this.commonSettings.currentData.lienPaymentsOrganization,
        defenseApprovalRequired: this.commonSettings.currentData.defenseApprovalRequired,
        multipleRoundsOfFunding: this.commonSettings.currentData.multipleRoundsOfFunding,
        enableLienTransfers: this.commonSettings.currentData.enableLienTransfers,
        isManualPaymentRequestsAllowed: this.commonSettings.currentData.isManualPaymentRequestsAllowed,
        isFeeAutomationEnabled: this.commonSettings.currentData.isFeeAutomationEnabled,
        isClosingStatementAutomationEnabled: this.commonSettings.currentData.isClosingStatementAutomationEnabled,
        isPaymentAutomationEnabled: this.commonSettings.currentData.isPaymentAutomationEnabled,
      },
    }));
  }

  private setValidation() {
    this.formValid.emit({
      formId: LedgerSetttingsFormSections.FirmMoneyMovement,
      valid: this.validate(),
    });
  }
}
