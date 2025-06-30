/* eslint-disable no-restricted-globals */
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Channel } from 'pusher-js';
import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';

import { SearchOptionsHelper } from '@app/helpers';
import { IdValue, PaymentRequest, PaymentRequestConfig } from '@app/models';
import { ClosingStatementDocumentStatusEnum, DocumentType, EntityTypeEnum, JobStatus, PaymentItemType } from '@app/models/enums';
import { AppliedPaymentTypeEnum } from '@app/models/enums/applied-payment-type.enum';
import { ISearchOptions } from '@app/models/search-options';
import { Dictionary } from '@app/models/utils';
import * as documentTemplateActions from '@app/modules/document-templates/state/actions';
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
import * as actions from '../../../../state/actions';
import * as selectors from '../../../../state/selectors';

enum PaymentTypesConfigFormFields {
  remittanceDetailsTemplateId = 'remittanceDetailsTemplateId',
  closingStatementTemplateId = 'closingStatementTemplateId',
  paymentCoversheetTemplateId = 'paymentCoversheetTemplateId',
  checkTableTemplateId = 'checkTableTemplateId',
}

enum CheckboxFieldNames {
  AttachClosingStatement = 'attachClosingStatement',
  AttachPaymentCoversheet = 'attachPaymentCoversheet',
  AttachCheckTable = 'attachCheckTable',
}

@Component({
  selector: 'app-payment-types-config-step',
  templateUrl: './payment-types-config-step.component.html',
  styleUrls: ['./payment-types-config-step.component.scss'],
})
export class PaymentTypesConfigStepComponent extends ValidationForm implements OnInit, OnDestroy {
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
  private allDocumentTemplates: SelectOption[];
  public documentTemplates: SelectOption[];

  public checkTableTemplateOptions: SelectOption[] = [
    { id: 1, name: 'Check Table' },
  ];

  @Output()
  readonly finish = new EventEmitter<PaymentRequest>();

  @Output()
  readonly fail = new EventEmitter<string>();

  @Output()
  readonly warning = new EventEmitter<PaymentRequest>();

  @Input()
    projectId: number;

  @Input()
    isGlobal?: boolean;

  @Input()
    searchOptions: ISearchOptions;

  @Input()
    paymentRequestEntityType: EntityTypeEnum;

  public reviewLogDocId: number;

  readonly documentTypes = DocumentType;
  readonly entityTypeEnum = EntityTypeEnum;
  readonly paymentTypes$ = this.store.select(selectors.paymentTypesForRequest);
  readonly projectFirmsOptions$ = this.store.select(batchSelectors.projectFirmsOptions);
  readonly documentTemplates$ = this.store.select(batchSelectors.closingStatementTemplates);
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

    this.generatePaymentRequestData$.pipe(
      filter((data: IdValue) => data !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((data: IdValue) => {
      this.unsubscribeFromChannel();
      this.channel = this.pusher.subscribeChannel(
        data.name,
        this.enumToArrayPipe.transformToKeysArray(JobStatus),
        this.generatePaymentRequestCallback.bind(this),
        () => this.store.dispatch(batchActions.ReviewPaymentRequestJob({ paymentRequestId: data.id })),
      );
    });

    this.documentTemplates$.pipe(
      filter((x: SelectOption[]) => !!x),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe((templates: SelectOption[]) => {
        this.allDocumentTemplates = templates;
        this.documentTemplates = templates;
      });

    this.store.dispatch(actions.GetPaymentTypesForPaymentRequest());
    this.store.dispatch(projectLedgerSettingsActions.LoadData({ projectId: this.projectId }));
    this.store.dispatch(batchActions.GetClosingStatementTemplates({ projectId: this.projectId, isProjectAssociated: true }));

    this.getPaymentCoversheetTemplateOptions();
    this.initEmptyForm();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    if (this.channel) {
      this.channel.unsubscribe();
    }
  }

  submit(): void {
    if (!super.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(commonActions.FormInvalid());
      return;
    }

    const request: PaymentRequestConfig = {
      ...this.form.value,
      paymentRequestEntityType: this.paymentRequestEntityType,
      paymentTypes: this.paymentTypesSelected.values(),
      paymentFirms: (this.isAllProjectFirmsChecked) ? null : this.projectFirmsSelected.values(),
      searchOptions: this.searchOptions,
    };
    if (!this.isGlobal) {
      this.store.dispatch(batchActions.GeneratePaymentRequest({
        params: {
          caseId: this.projectId,
          paymentRequestConfig: request,
        },
      }));
    } else {
      this.store.dispatch(batchActions.GeneratePaymentRequestGlobal({
        params: {
          paymentRequestConfig: request,
        },
      }));
    }
    this.submitting = true;
  }

  onToggleValidatorFor(checkboxFieldName: string, targetFieldName: string): void {
    const checked = this.form.get(checkboxFieldName).value;
    const targetField = this.form.get(targetFieldName);

    if (checked) {
      if (checkboxFieldName === CheckboxFieldNames.AttachClosingStatement) {
        this.store.select(projectLedgerSettingsSelectors.closingStatementTemplateId)
          .pipe(filter((x: number) => !!x), takeUntil(this.ngUnsubscribe$))
          .subscribe((id: number) => {
            const found = this.allDocumentTemplates.find((s: SelectOption) => s.id === id);
            if (found) {
              targetField.setValue(id);
            }
          });
      }

      if (targetFieldName === PaymentTypesConfigFormFields.remittanceDetailsTemplateId) {
        targetField.setValue(null);
      }

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

  onSearchDocumentTemplates(text: string): void {
    this.documentTemplates = this.allDocumentTemplates.filter((template: SelectOption) => template.name.toLowerCase().includes(text.toLowerCase()));
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
      && this.paymentRequestEntityType === EntityTypeEnum.ClaimSettlementLedgerEntries) {
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

    this.onToggleValidatorFor(CheckboxFieldNames.AttachPaymentCoversheet, PaymentTypesConfigFormFields.paymentCoversheetTemplateId);
    this.onToggleValidatorFor(CheckboxFieldNames.AttachCheckTable, PaymentTypesConfigFormFields.checkTableTemplateId);
  }

  private generatePaymentRequestCallback(data: PaymentRequest | string, event: string): void {
    switch (event) {
      case JobStatus[JobStatus.ReviewCompleted]: {
        const result = data as PaymentRequest;
        if (result.ReviewLogDocId) {
          this.reviewLogDocId = result.ReviewLogDocId;
        }
        if (result.ReviewDocId) {
          this.store.dispatch(batchActions.GeneratePaymentRequestJobSuccess());
          this.finish.emit(result);
        } else {
          this.store.dispatch(batchActions.GeneratePaymentRequestJobFailed());
          this.fail.emit(data ? data as string : 'Completed with empty response.');
        }
        this.stopSubmitting();
        this.unsubscribeFromChannel();
        break;
      }

      case JobStatus[JobStatus.Warning]:
        this.store.dispatch(batchActions.GeneratePaymentRequestJobFailed());
        this.warning.emit(data as PaymentRequest);
        this.stopSubmitting();
        break;
      case JobStatus[JobStatus.Error]:
        this.store.dispatch(batchActions.GeneratePaymentRequestJobFailed());
        this.fail.emit(data as string);
        this.stopSubmitting();
        break;
    }
  }

  private initEmptyForm(): void {
    this.form = this.formBuilder.group(new PaymentRequestConfig());
    // AC-7587
    // this.onToggleValidatorFor('attachLetterForLiens', 'attachLetterForLiensTemplateId');
    this.onToggleValidatorFor(CheckboxFieldNames.AttachClosingStatement, PaymentTypesConfigFormFields.closingStatementTemplateId);

    if (this.paymentRequestEntityType === EntityTypeEnum.ClaimSettlementLedgerEntries) {
      this.toggleLienCheckboxes(false);
    }
  }

  private stopSubmitting(): void {
    this.submitting = false;
    this.unsubscribeFromChannel();
  }

  private unsubscribeFromChannel(): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
      this.channel = null;
    }
  }

  private getPaymentCoversheetTemplateOptions(): void {
    if (this.paymentRequestEntityType !== EntityTypeEnum.ClaimSettlementLedgerEntries) {
      return;
    }

    const params = SearchOptionsHelper.getFilterRequest([
      SearchOptionsHelper.getContainsFilter(
        'document.documentTypeId',
        'number',
        'contains',
        `${DocumentType.PaymentCoversheetTemplate}`,
      ),
      SearchOptionsHelper.getNumberFilter(
        'document.statusId',
        'number',
        'equals',
        ClosingStatementDocumentStatusEnum.Published,
      ),
    ]);

    this.store.dispatch(documentTemplateActions.SearchDocumentTemplateOptions({
      params,
      documentType: DocumentType.PaymentCoversheetTemplate,
    }));
  }
}
