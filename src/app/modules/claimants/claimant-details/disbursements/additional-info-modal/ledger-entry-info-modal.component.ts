import { PercentPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonHelper, SearchOptionsHelper } from '@app/helpers';
import { PaymentInstructionsValidationHelper, QSF_ORG_NO_TRANSFER_ID } from '@app/helpers/payment-instructions-validation.helper';
import { PaymentInstruction } from '@app/models';
import { LedgerEntryInfo } from '@app/models/closing-statement/ledger-entry-info';
import { ClaimSettlementLedgerEntryStatus, LedgerAccountGroup, PaymentTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { AuthorizeLedgersEntriesRequest } from '@app/models/ledger/authorize-ledger-entries-request';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { PermissionService, ToastService, ValidationService } from '@app/services';
import { LedgerEntryService } from '@app/services/ledger-entry.service';
import * as fromShared from '@app/state';
import { IGridLocalData } from '@app/state/root.state';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';
import { ClaimSettlementLedgerPaymentInstructionStatus } from '@app/models/enums/ledger-settings/claim-settlement-ledger-payment-instruction-status';
import * as actions from '../../state/actions';
import { IPaymentInstructionsState } from '../../state/reducer';
import * as selectors from '../../state/selectors';
import { PaymentInstructionsGridComponent } from './payment-instructions-grid/payment-instructions-grid.component';

@Component({
  selector: 'app-ledger-entry-info-modal',
  templateUrl: './ledger-entry-info-modal.component.html',
  styleUrls: ['./ledger-entry-info-modal.component.scss'],
  providers: [PercentPipe],
})
export class LedgerEntryInfoModalComponent extends ValidationForm implements OnInit, OnDestroy {
  public title: string;
  public ledgerId: number;
  public ledgerEntryId: number;
  public ledgerEntryInfo$ = this.store.select(selectors.ledgerEntryInfo);
  private readonly paymentInstructions = this.store.select(selectors.paymentInstructions);
  public ledgerEntryInfo: LedgerEntryInfo;
  public validationErrors: string[] = [];
  public defaultPayeeId: number;
  public paymentType: PaymentTypeEnum;
  public transferMethodVisible: boolean;

  @ViewChild(PaymentInstructionsGridComponent)
  readonly paymentInstructionsGrid: PaymentInstructionsGridComponent;

  protected readonly canViewTransfersPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.TransferToSubAccount));

  private ngUnsubscribe$ = new Subject<void>();

  readonly paymentTypes = PaymentTypeEnum;

  readonly awaitedActionTypes = [
    actions.Error.type,
    actions.UpdateLedgerEntryInfoSuccess.type,
  ];

  public form: UntypedFormGroup = new UntypedFormGroup({
    description: new UntypedFormControl(null),
    payee: new UntypedFormControl(null),
    sendPaymentTo: new UntypedFormControl(null),
    payerAccount: new UntypedFormControl(null),
    paymentType: new UntypedFormControl(null),
    enabled: new UntypedFormControl(null),
    notes: new UntypedFormControl(null, [Validators.maxLength(500)]),
    transfer: new UntypedFormControl(null),
  });

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get isFormValid(): boolean {
    return this.form.valid && !this.hasValidationErrors;
  }

  get paymentInstructionsVisible(): boolean {
    return this.ledgerEntryInfo?.status?.id !== ClaimSettlementLedgerEntryStatus.NonPayable;
  }

  public get isMDL(): boolean {
    return this.ledgerEntryInfo?.accountGroup === LedgerAccountGroup.MDL;
  }

  public get isCBF(): boolean {
    return this.ledgerEntryInfo?.accountGroup === LedgerAccountGroup.CommonBenefit;
  }

  public get paymentInstructionsEditable(): boolean {
    return this.form?.get('enabled')?.value
    && (this.ledgerEntryInfo?.status?.id === ClaimSettlementLedgerEntryStatus.Pending
      || this.ledgerEntryInfo?.status?.id === ClaimSettlementLedgerEntryStatus.PaymentAuthorized
      || this.ledgerEntryInfo?.status?.id === ClaimSettlementLedgerEntryStatus.PaymentAuthorizedPartial);
  }

  public get paymentInstructionAuthorizable(): boolean {
    return this.form?.get('enabled')?.value
    && (this.ledgerEntryInfo?.status?.id === ClaimSettlementLedgerEntryStatus.Pending
      || this.ledgerEntryInfo?.status?.id === ClaimSettlementLedgerEntryStatus.Void
      || this.ledgerEntryInfo?.status?.id === ClaimSettlementLedgerEntryStatus.PaymentAuthorizedPartial
      || this.isSplitPaymentInstructionAuthorizable)
    && this.ledgerEntryInfo?.enableIndividualAuthorize
    && this.permissionService.has(PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.AuthorizeLedgerEntries));
  }

  public get transferControl(): AbstractControl {
    return this.form.get('transfer');
  }

  public get paymentTypeControl(): AbstractControl {
    return this.form.get('paymentType');
  }

  public get isTransferMethodVisible(): boolean {
    const paymentType = this.paymentTypeControl.value;
    return (paymentType == PaymentTypeEnum.Default
      || paymentType == PaymentTypeEnum.Individual
      || paymentType == PaymentTypeEnum.Split
    ) && this.canViewTransfersPermission;
  }

  private isSplitPaymentInstructionAuthorizable(): boolean {
    return this.ledgerEntryInfo?.splitTypeId === PaymentTypeEnum.Split
          && this.ledgerEntryInfo?.paymentInstructions?.some((pi: PaymentInstruction) => pi.statusId === ClaimSettlementLedgerPaymentInstructionStatus.Pending);
  }

  get isPaymentAvailable(): boolean {
    return this.ledgerEntryInfo?.isPaymentEnabledVisible
           && this.ledgerEntryInfo?.status?.id !== ClaimSettlementLedgerEntryStatus.NonPayable;
  }

  get showNone(): boolean {
    return this.ledgerEntryInfo?.isPaymentEnabledVisible === false
          || this.ledgerEntryInfo?.status?.id === ClaimSettlementLedgerEntryStatus.NonPayable;
  }

  private get hasValidationErrors(): boolean {
    return this.validationErrors && this.validationErrors.length > 0;
  }

  get paymentTypeWidth(): string {
    return '400px';
  }

  constructor(
    private readonly store: Store<fromShared.AppState>,
    private readonly modalService: BsModalRef,
    private readonly actionsSubj: ActionsSubject,
    private readonly toaster: ToastService,
    public readonly ledgerEntryService: LedgerEntryService,
    public readonly permissionService: PermissionService,
    private router: Router,
  ) { super(); }

  ngOnInit(): void {
    this.subscribe();
    this.store.dispatch(actions.GetLedgerEntryInfo({ id: this.ledgerEntryId }));
  }

  public onAuthorize(): void {
    this.toggleNotesRequiredValidation(true);
    if (!this.validate() || this.hasValidationErrors) {
      this.store.dispatch(actions.Error({ error: 'Notes field is required for authorization' }));
      return;
    }
    this.store
      .select(fromShared.gridLocalDataByGridId({ gridId: this.paymentInstructionsGrid?.gridId }))
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((data: IGridLocalData) => {
        const request = this.getSelectedEntries(data);
        this.store.dispatch(actions.AuthorizeLedgerEntries({ ledgerId: this.ledgerId, request }));
      });
  }

  public onSave(): void {
    this.toggleNotesRequiredValidation(false);
    if (!this.validate() || this.hasValidationErrors) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }

    this.paymentInstructions.pipe(
      first(),
    ).subscribe((state: IPaymentInstructionsState) => {
      const isPaymentEnabled = this.form.value.enabled || false;
      const splitTypeId = this.form.get('paymentType').value;

      let paymentInstructions: PaymentInstruction[];
      if (isPaymentEnabled && splitTypeId !== PaymentTypeEnum.Default && state && state.items && state.items.length > 0) {
        paymentInstructions = [...state.items];
      } else {
        paymentInstructions = [];
      }

      const validationResult = PaymentInstructionsValidationHelper.validate(state);
      if (validationResult.isAmountValid && validationResult.isPercentageValid && validationResult.isFilled) {
        paymentInstructions.forEach((pi: PaymentInstruction) => {
          if (this.isTransferMethodVisible && this.transferControl?.value) {
            if (pi.qsfOrgId == QSF_ORG_NO_TRANSFER_ID) {
              pi.qsfOrgId = null;
              pi.qsfBankAccountId = null;
            }
          }
        });

        const ledgerEntryInfo: Partial<LedgerEntryInfo> = {
          id: this.ledgerEntryId,
          description: this.form.value.description,
          isPaymentEnabled,
          splitTypeId,
          paymentInstructions,
        };

        this.store.dispatch(actions.UpdateLedgerEntryInfo({ ledgerId: this.ledgerId, ledgerEntryInfo }));
      } else {
        this.store.dispatch(actions.Error({ error: 'Form invalid' }));
      }
    });
  }

  onClose(): void {
    this.modalService.hide();
  }

  private initForm(ledgerEntryInfo: LedgerEntryInfo): void {
    this.paymentType = !CommonHelper.isNullOrUndefined(ledgerEntryInfo.splitTypeId) ? ledgerEntryInfo.splitTypeId : PaymentTypeEnum.Default;
    this.form.patchValue({
      description: ledgerEntryInfo.description,
      enabled: ledgerEntryInfo.enabled,
      paymentType: this.paymentType,
      notes: ledgerEntryInfo.notes,
      transfer: ledgerEntryInfo.transfer,
    });
    this.form.updateValueAndValidity();
  }

  private toggleNotesRequiredValidation(validate: boolean): void {
    const control = this.form.controls['notes'];
    if (validate) {
      control.setValidators(ValidationService.noEmptyStringInHTMLValidator);
    } else {
      control.setValidators(null);
    }
    control.updateValueAndValidity();
  }

  private subscribe(): void {
    this.ledgerEntryInfo$
      .pipe(
        filter((item: LedgerEntryInfo) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((item: LedgerEntryInfo) => {
        this.ledgerEntryInfo = item;
        this.initForm(item);
      });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.UpdateLedgerEntryInfoSuccess),
    ).subscribe(() => {
      this.onClose();
    });

    this.paymentTypeControl.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((newValue: PaymentTypeEnum) => {
      switch (newValue) {
        case PaymentTypeEnum.Default:
          this.transferControl.disable();
          break;
        case PaymentTypeEnum.Individual:
        case PaymentTypeEnum.Split:
          this.transferControl.enable();
          break;
      }
    });
  }

  protected getSelectedEntries(data: IGridLocalData): AuthorizeLedgersEntriesRequest {
    const searchOptions = SearchOptionsHelper.createSearchOptions(data);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;

    const request: AuthorizeLedgersEntriesRequest = {
      ledgersEntitiesSearchOption: searchOptions,
      notes: this.form.get('notes').value,
      ledgerEntryId: this.ledgerEntryId,
      paymentType: this.paymentType,
    };
    return request;
  }

  public onValidate(errors: string[]): void {
    this.validationErrors = errors;
  }

  public onTransferMethod(isTransfer: boolean): void {
    this.form.patchValue({ transfer: isTransfer });
  }

  public redirectToPayment(paymentId): void {
    this.onClose();
    this.router.navigate([`/admin/payments/${paymentId}/tabs/details`]);
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.ClearLedgerEntryInfo());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
