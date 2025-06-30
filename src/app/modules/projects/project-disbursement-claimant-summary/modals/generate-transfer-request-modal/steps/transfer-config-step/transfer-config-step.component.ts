/* eslint-disable no-restricted-globals */
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Channel } from 'pusher-js';
import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';

import { StringHelper } from '@app/helpers';
import { IdValue, PaymentRequestConfig } from '@app/models';
import { BatchActionDto } from '@app/models/batch-action/batch-action';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { DocumentType, EntityTypeEnum, JobNameEnum, PaymentItemType } from '@app/models/enums';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { ProgressValuesPusherChannel } from '@app/models/file-imports/progress-values-with-channel';
import { ISearchOptions } from '@app/models/search-options';
import { ICreateTransferRequest } from '@app/models/transfer-request/create-transfer-request';
import { Dictionary } from '@app/models/utils';
import * as documentTemplatesSelectors from '@app/modules/document-templates/state/selectors';
import * as projectLedgerSettingsActions from '@app/modules/projects/project-ledger-settings/state/actions';
import * as projectLedgerSettingsSelectors from '@app/modules/projects/project-ledger-settings/state/selectors';
import * as batchActions from '@app/modules/projects/state/actions';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import * as batchSelectors from '@app/modules/projects/state/selectors';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { MultiSelectOption } from '@app/modules/shared/multiselect-list/multiselect-list.component';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { ToastService } from '@app/services';
import { PusherService } from '@app/services/pusher.service';
import { AppliedPaymentTypeEnum } from '@app/models/enums/applied-payment-type.enum';
import * as actions from '../../../../state/actions';
import * as selectors from '../../../../state/selectors';

@Component({
  selector: 'app-transfer-config-step',
  templateUrl: './transfer-config-step.component.html',
  styleUrl: './transfer-config-step.component.scss',
})
export class TransferConfigStepComponent extends ValidationForm implements OnInit, OnDestroy {
  private readonly FeesAndExpensesItemsTypes = [
    PaymentItemType.PrimaryFirmFees,
    PaymentItemType.ReferringFirmFees,
    PaymentItemType.SettlementCounselFees,
    PaymentItemType.PrimaryFirmExpenses,
    PaymentItemType.ReferringFirmExpenses,
    PaymentItemType.SettlementCounselExpenses,
  ];
  private readonly ngUnsubscribe$ = new Subject<void>();
  private channel: Channel;
  private transferChannel: Channel;
  public documentTemplates: SelectOption[];

  public checkTableTemplateOptions: SelectOption[] = [
    { id: 1, name: 'Check Table' },
  ];

  @Output()
  readonly finishTransfer = new EventEmitter<GridPusherMessage>();

  @Output()
  readonly fail = new EventEmitter<string>();

  @Output()
  readonly warningTransfer = new EventEmitter<GridPusherMessage>();

  @Input()
    projectId: number;

  @Input()
    isGlobal?: boolean;

  @Input()
    searchOptions: ISearchOptions;

  @Input()
    transferRequestEntityType: EntityTypeEnum;

  @Input()
  public type: string;

  public reviewLogDocId: number;

  readonly documentTypes = DocumentType;
  readonly entityTypeEnum = EntityTypeEnum;
  readonly paymentTypes$ = this.store.select(selectors.paymentTypesForRequest);
  readonly projectFirmsOptions$ = this.store.select(batchSelectors.projectFirmsOptions);
  readonly generatePaymentRequestData$ = this.store.select(batchSelectors.generatePaymentRequestData);
  readonly remittanceDetailsTemplateOptions$ = this.store.select(documentTemplatesSelectors.documentTemplatesDropdownValues(DocumentType.RemittanceDetailsTemplate));
  readonly paymentCoversheetTemplateOptions$ = this.store.select(documentTemplatesSelectors.documentTemplatesDropdownValues(DocumentType.PaymentCoversheetTemplate));

  paymentTypes: SelectOption[];
  projectFirmsOptions: SelectOption[];
  paymentTypesSelected = new Dictionary<number, number>();
  projectFirmsSelected = new Dictionary<number, number>();
  isAllPaymentTypesChecked = false;
  isAllProjectFirmsChecked = false;
  submitting = false;
  form: UntypedFormGroup;

  get valid(): boolean {
    return (!this.form || this.form.valid)
      && (this.isAllPaymentTypesChecked || this.paymentTypesSelected.count() > 0);
  }

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    private readonly toaster: ToastService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly pusher: PusherService,
    private readonly enumToArrayPipe: EnumToArrayPipe,
  ) {
    super();
  }

  get canSelectFirms(): boolean {
    return this.paymentTypesSelected.values().some((r: number) => this.FeesAndExpensesItemsTypes.includes(r));
  }

  ngOnInit(): void {
    this.paymentTypes$.pipe(
      first((paymentTypes: IdValue[]) => paymentTypes !== null && paymentTypes.length > 0),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((paymentTypes: IdValue[]) => {
      this.paymentTypes = [...paymentTypes];
    });

    this.projectFirmsOptions$.pipe(
      first((projectFirmsOptions: IdValue[]) => projectFirmsOptions !== null && projectFirmsOptions.length > 0),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((projectFirmsOptions: IdValue[]) => {
      this.projectFirmsOptions = [...projectFirmsOptions];
    });

    this.store.dispatch(actions.GetPaymentTypesForPaymentRequest());
    this.store.dispatch(projectLedgerSettingsActions.LoadData({ projectId: this.projectId }));
    this.store.dispatch(batchActions.GetClosingStatementTemplates({ projectId: this.projectId, isProjectAssociated: true }));

    this.initEmptyForm();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    if (this.channel) {
      this.channel.unsubscribe();
    }
    if (this.transferChannel) {
      this.transferChannel.unsubscribe();
    }
  }

  submit(): void {
    if (!super.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(commonActions.FormInvalid());
      return;
    }
    this.submitTransferRequest();

    this.submitting = true;
  }

  submitTransferRequest(): void {
    const filters: ICreateTransferRequest = {
      searchOptions: this.searchOptions,
      paymentTypes: this.paymentTypesSelected.values(),
      paymentFirms: (this.isAllProjectFirmsChecked) ? null : this.projectFirmsSelected.values(),
    };
    const batchRequest: BatchActionDto = {
      batchActionTemplateId: BatchActionTemplate.LedgerEntryTransfer,
      entityTypeId: this.transferRequestEntityType,
      entityId: this.projectId,
      batchActionFilters: [{ filter: JSON.stringify(filters) }],
      pusherChannelName: StringHelper.generateChannelName(JobNameEnum.TransferRequest, this.projectId),
    };

    this.unsubscribeFromTransferChannel();
    this.transferChannel = this.pusher.subscribeChannel(
      batchRequest.pusherChannelName,
      this.enumToArrayPipe.transformToKeysArray(BatchActionStatus),
      this.generateTransferRequestCallback.bind(this),
      () => this.store.dispatch(batchActions.GenerateTransferRequest({
        params: batchRequest,
      })),
    );
  }

  onToggleValidatorFor(checkboxFieldName: string, targetFieldName: string): void {
    const checked = this.form.get(checkboxFieldName).value;
    const targetField = this.form.get(targetFieldName);

    if (checked) {
      this.store.select(projectLedgerSettingsSelectors.closingStatementTemplateId)
        .pipe(filter((x: number) => !!x), takeUntil(this.ngUnsubscribe$))
        .subscribe((id: number) => targetField.setValue(id));

      targetField.setValidators(Validators.required);
      targetField.enable();
    } else {
      targetField.clearValidators();
      targetField.setValue(null);
      targetField.disable();
    }
    targetField.updateValueAndValidity();
  }

  public onSelectPaymentType({ id, checked, index }: MultiSelectOption): void {
    this.paymentTypes[index] = { ...this.paymentTypes[index], checked };
    if (this.isAllPaymentTypesChecked && !checked) {
      this.isAllPaymentTypesChecked = false;
    }

    if (id === AppliedPaymentTypeEnum.Lien) {
      this.paymentTypes = this.paymentTypes.map((type: SelectOption) => ({
        ...type,
        checked: type.id === AppliedPaymentTypeEnum.Lien ? checked : false,
        disabled: type.id !== AppliedPaymentTypeEnum.Lien && checked,
      }));
    } else if (checked) {
      this.paymentTypes = this.paymentTypes.map((type: SelectOption) => ({
        ...type,
        disabled: type.id === AppliedPaymentTypeEnum.Lien,
      }));
    }

    if (!this.paymentTypes.find((type: SelectOption) => type.id === AppliedPaymentTypeEnum.Lien)?.checked) {
      this.paymentTypes = this.paymentTypes.map((type: SelectOption) => ({ ...type, disabled: type.id === AppliedPaymentTypeEnum.Lien && this.paymentTypes.some((option: SelectOption) => option.checked) }));
    }

    this.togglePaymentType(id, checked);
  }

  public onSelectProjectFirms({ id, checked, index }: MultiSelectOption): void {
    this.projectFirmsOptions[index] = { ...this.projectFirmsOptions[index], checked };
    if (this.isAllProjectFirmsChecked && !checked) {
      this.isAllProjectFirmsChecked = false;
    }
    this.toggleProjectFirms(id, checked);
  }

  public onSelectAllPaymentTypes(checked: boolean): void {
    this.paymentTypes$.pipe(
      filter((paymentTypes: IdValue[]) => paymentTypes !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((paymentTypes: IdValue[]) => {
      this.paymentTypes = paymentTypes.map((type: SelectOption) => {
        if (checked && type.id === AppliedPaymentTypeEnum.Lien) {
          this.togglePaymentType(type.id, false);
          return { ...type, checked: false, disabled: true };
        }
        this.togglePaymentType(type.id as number, checked);
        return { ...type, checked, disabled: false };
      });
      this.isAllPaymentTypesChecked = checked;
    });
  }

  public onSelectAllProjectFirms(checked: boolean): void {
    this.projectFirmsOptions$.pipe(
      filter((projectFirmsOptions: IdValue[]) => projectFirmsOptions !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((projectFirmsOptions: IdValue[]) => {
      projectFirmsOptions.forEach((type: IdValue, index: number) => {
        this.projectFirmsOptions[index] = { ...type, checked };
        this.toggleProjectFirms(type.id, checked);
      });
      this.isAllProjectFirmsChecked = checked;
    });
  }

  searchFn(): boolean {
    return true;
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  private togglePaymentType(id: number, checked: boolean): void {
    if (checked) {
      this.paymentTypesSelected.setValue(id, id);
    } else {
      this.paymentTypesSelected.remove(id);
    }
    if (id === PaymentItemType.Lien
      && this.transferRequestEntityType === EntityTypeEnum.ClaimSettlementLedgerEntries) {
      this.toggleLienCheckboxes(checked);
    }
  }

  private toggleProjectFirms(id: number, checked: boolean): void {
    if (checked) {
      this.projectFirmsSelected.setValue(id, id);
    } else {
      this.projectFirmsSelected.remove(id);
    }
  }

  private toggleLienCheckboxes(isLienChecked: boolean): void {
    const attachPaymentCoversheetField = this.form.get('attachPaymentCoversheet');
    const attachCheckTableField = this.form.get('attachCheckTable');
    if (isLienChecked) {
      attachPaymentCoversheetField.setValue(true);
      attachCheckTableField.setValue(true);
      attachPaymentCoversheetField.enable();
      attachCheckTableField.enable();
    } else {
      attachPaymentCoversheetField.setValue(false);
      attachCheckTableField.setValue(false);
      attachPaymentCoversheetField.disable();
      attachCheckTableField.disable();
    }
    attachPaymentCoversheetField.updateValueAndValidity();
    attachCheckTableField.updateValueAndValidity();
  }

  private generateTransferRequestCallback(data: GridPusherMessage | string, event: string): void {
    switch (event) {
      case BatchActionStatus[BatchActionStatus.Complete]: {
        const message = GridPusherMessage.toModel(data);
        const result = ProgressValuesPusherChannel.toModel(message, this.transferChannel.name);

        this.store.dispatch(batchActions.UpdateProgressBarData({ progressBarData: result }));
        this.store.dispatch(batchActions.GenerateTransferRequestJobSuccess({ jobResult: result }));
        this.finishTransfer.emit(message);

        this.stopSubmitting();
        this.unsubscribeFromTransferChannel();
        break;
      }
      case BatchActionStatus[BatchActionStatus.Reviewing]: {
        const message = GridPusherMessage.toModel(data);
        const result = ProgressValuesPusherChannel.toModel(message, this.transferChannel.name);

        this.store.dispatch(batchActions.UpdateProgressBarData({ progressBarData: result }));
        break;
      }
      case BatchActionStatus[BatchActionStatus.Error]:
        this.store.dispatch(batchActions.GenerateTransferRequestJobFailed());
        this.fail.emit(data as string);
        this.stopSubmitting();
        break;
    }
  }

  private initEmptyForm(): void {
    this.form = this.formBuilder.group(new PaymentRequestConfig());

    if (this.transferRequestEntityType === EntityTypeEnum.ClaimSettlementLedgerEntries) {
      this.toggleLienCheckboxes(false);
    }
  }

  private stopSubmitting(): void {
    this.submitting = false;
    this.unsubscribeFromChannel();
    this.unsubscribeFromTransferChannel();
  }

  private unsubscribeFromChannel(): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
      this.channel = null;
    }
  }

  private unsubscribeFromTransferChannel(): void {
    if (this.transferChannel) {
      this.pusher.unsubscribeChannel(this.transferChannel);
      this.transferChannel = null;
    }
  }
}
