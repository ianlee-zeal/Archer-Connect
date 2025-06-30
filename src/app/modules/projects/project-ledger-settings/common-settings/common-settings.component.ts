import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { LedgerSetttingsFormSections } from '@app/models/enums/ledger-settings/form-sections';
import { CommonHelper } from '@app/helpers';

import { ModalService, PermissionService, ProjectProductCategoriesService } from '@app/services';
import { OrganizationSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/organization-selection-modal.component';
import { IdValue, Org } from '@app/models';
import { ClaimSettlementCurrentData } from '@app/models/ledger-settings/ledger-settings-current-data';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { QSFType } from '@app/models/enums/ledger-settings/qsf-type';
import { LedgerSettingsState } from '../state/reducer';
import * as actions from '../state/actions';
import { ValidationForm } from '../../../shared/_abstractions/validation-form';
import * as selectors from '../state/selectors';
import { PermissionActionTypeEnum, PermissionTypeEnum, ProductCategory, ProjectScopeStatusEnum } from '@app/models/enums';
import { TooltipPositionEnum } from '@app/models/enums/tooltip-position.enum';
import { ProjectProductCategory } from '@app/models/scope-of-work';

interface CommonSettingsFormValue {
  qsfProductId: IdValue;
  netAllocationThreshold: string;
  lienPaymentsOrganizationName: string;
  defenseApprovalRequired: boolean;
  multipleRoundsOfFunding: boolean;
  enableLienTransfers: boolean;
  isManualPaymentRequestsAllowed: boolean;
  isFeeAutomationEnabled: boolean;
  isClosingStatementAutomationEnabled: boolean;
  isPaymentAutomationEnabled: boolean;
  isLienImportAutomationEnabled: boolean;
}

@Component({
  selector: 'app-common-settings',
  templateUrl: './common-settings.component.html',
  styleUrls: ['./common-settings.component.scss'],
})
export class CommonSettingsComponent extends ValidationForm implements OnInit {
  @Input() public projectId: number;

  public ngUnsubscribe$ = new Subject<void>();
  public qsfProductOptions: SelectOption[] = [];
  public commonSettings$ = this.store.select(selectors.commonSettings);
  public commonSettings;
  public form: UntypedFormGroup;
  public lienPaymentsOrganizationId: number;
  public isDefaultLienPaymentsOrganization: boolean;
  public canChangeManualPaymentRequestsAllowed: boolean;
  public manualPaymentRequestTooltip: string = 'This setting is only actionable with the correct permissions.';
  public tooltipPosition: TooltipPositionEnum = TooltipPositionEnum.Right;
  public lienResolutionSetting: ProjectProductCategory;
  public readonly canViewPaymentAutomationPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.GTFPaymentAutomation)) || this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.EnhancedPaymentAutomation));
  public readonly hasLienImportAutomationPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.LienImportAutomation));
  public canViewLienImportAutomationPermission;
  public lienImportAutomationTooltip: string = 'Scope of Work for Lien Resolution must be set to Yes.';
  public paymentAutomationTooltip: string;


  @Output() formChanged = new EventEmitter();
  @Output() formValid = new EventEmitter();

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  protected get canViewPaymentAutomation(): boolean {
    return this.canViewPaymentAutomationPermission;
  }

  public readonly formFields = {
    netAllocationThreshold: 'netAllocationThreshold',
    qsfProductId: 'qsfProductId',
    defenseApprovalRequired: 'defenseApprovalRequired',
    multipleRoundsOfFunding: 'multipleRoundsOfFunding',
    enableLienTransfers: 'enableLienTransfers',
    isManualPaymentRequestsAllowed: 'isManualPaymentRequestsAllowed',
    isFeeAutomationEnabled: 'isFeeAutomationEnabled',
    isClosingStatementAutomationEnabled: 'isClosingStatementAutomationEnabled',
    isPaymentAutomationEnabled: 'isPaymentAutomationEnabled',
    isLienImportAutomationEnabled: 'isLienImportAutomationEnabled',
  };

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly store: Store<LedgerSettingsState>,
    private modalService: ModalService,
    private readonly permissionService: PermissionService,
    private readonly projectProductCategoryService: ProjectProductCategoriesService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadSubscriptions();
  }

  loadSubscriptions() {
    this.commonSettings$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.commonSettings = item;
        this.qsfProductOptions = this.commonSettings.qsfProductOptions;
        this.lienPaymentsOrganizationId = this.commonSettings.currentData.lienPaymentsOrganization?.id;
        this.isDefaultLienPaymentsOrganization = this.commonSettings.currentData.isDefaultLienPaymentsOrganization;
        this.projectProductCategoryService
          .getProductCategoryStatus(this.projectId, ProductCategory.MedicalLiens)
          .subscribe(setting => {
            this.lienResolutionSetting = setting;
          });
        this.canViewLienImportAutomationPermission = this.commonSettings?.currentData?.isLienImportAutomationPermissionEnabled && this.hasLienImportAutomationPermission;
        this.setFormValues();
        this.setValidation();
      });

    // This is needed to emit "form changed" event when we type in the text field (Net Allocation),
    // and trigger validation in the parent component for enable the save button
    this.form.valueChanges
      .subscribe(() => {
        this.formChanged.emit();
      });
  }

  setFormValues() {
    const { currentData } = this.commonSettings;
    this.form.setValue({
      netAllocationThreshold: CommonHelper.getPercentageValue(currentData.netAllocationThreshold, 8),
      qsfProductId: this.getQSFProductIdOption(currentData.qsfProductId),
      lienPaymentsOrganizationName: currentData.lienPaymentsOrganization ? currentData.lienPaymentsOrganization.name : null,
      defenseApprovalRequired: currentData.defenseApprovalRequired,
      multipleRoundsOfFunding: currentData.multipleRoundsOfFunding ? currentData.multipleRoundsOfFunding : null,
      enableLienTransfers: currentData.enableLienTransfers ? currentData.enableLienTransfers : null,
      isManualPaymentRequestsAllowed: currentData.isManualPaymentRequestsAllowed ? currentData.isManualPaymentRequestsAllowed : null,
      isFeeAutomationEnabled: currentData.isFeeAutomationEnabled ? currentData.isFeeAutomationEnabled : null,
      isClosingStatementAutomationEnabled: currentData.isClosingStatementAutomationEnabled? currentData.isClosingStatementAutomationEnabled:null,
      isPaymentAutomationEnabled: currentData.isPaymentAutomationEnabled ? currentData.isPaymentAutomationEnabled : null,
      isLienImportAutomationEnabled: currentData.isLienImportAutomationEnabled ? currentData.isLienImportAutomationEnabled : null,
    });
  }

  getQSFProductIdOption(qsfProductId: number): SelectOption {
    const selectedOptions = this.qsfProductOptions.filter(i => i.id === qsfProductId);
    const qsfProductIdOption: SelectOption = selectedOptions.length > 0 ? selectedOptions[0] : null;
    return qsfProductIdOption;
  }

  initForm(): void {
    const canChangeManualPaymentRequestsAllowed = this.permissionService
      .has(PermissionService.create(PermissionTypeEnum.ProjectSettings, PermissionActionTypeEnum.ManualPaymentRequestsAllowed));
    this.form = this.fb.group({
      qsfProductId: [null, Validators.required],
      netAllocationThreshold: [null, [Validators.required, Validators.max(100)]],
      lienPaymentsOrganizationName: [null],
      defenseApprovalRequired: [false],
      multipleRoundsOfFunding: [false],
      enableLienTransfers: [false],
      isManualPaymentRequestsAllowed: [{ value: false, disabled: !canChangeManualPaymentRequestsAllowed }],
      isFeeAutomationEnabled: [false],
      isClosingStatementAutomationEnabled: [false],
      isPaymentAutomationEnabled: [false],
      isLienImportAutomationEnabled: [false],
    });
  }

  public onChanges(): void {
    this.updateState();
    this.setValidation();
    this.formChanged.emit();
  }

  public onOpenOrganizationModal(): void {
    this.modalService.show(OrganizationSelectionModalComponent, {
      initialState: {
        onEntitySelected: (entity: Org) => this.onOrganizationSelected(entity),
        gridDataFetcher: (params: IServerSideGetRowsParamsExtended) => this.store.dispatch(sharedActions.SearchFirms({ params })),
      },
      class: 'entity-selection-modal',
    });
  }

  public onClearLienPaymentsOrganization(): void {
    this.form.patchValue({ lienPaymentsOrganizationName: null });
    this.lienPaymentsOrganizationId = null;
    this.form.updateValueAndValidity();
    this.updateState();
  }

  private onOrganizationSelected(organization: Org): void {
    this.form.patchValue({ lienPaymentsOrganizationName: organization.name });
    this.lienPaymentsOrganizationId = organization.id;
    this.form.updateValueAndValidity();
    this.updateState();
  }

  private updateState() {
    const formValue: CommonSettingsFormValue = this.form.value;
    const isQsfGrossFirm = formValue.qsfProductId?.id === QSFType.GrossToFirm;
    const isQsfProductIdChanged = formValue.qsfProductId?.id !== this.commonSettings.currentData.qsfProductId;

    const currentData: ClaimSettlementCurrentData = {
      qsfProductId: formValue.qsfProductId?.id,
      netAllocationThreshold: +formValue.netAllocationThreshold,
      isQsfServiceChanged: isQsfProductIdChanged,
      lienPaymentsOrganization: this.form.controls.lienPaymentsOrganizationName.value && this.lienPaymentsOrganizationId
        ? new IdValue(this.lienPaymentsOrganizationId, this.form.controls.lienPaymentsOrganizationName.value)
        : null,
      defenseApprovalRequired: formValue.defenseApprovalRequired ?? false,
      multipleRoundsOfFunding: formValue.multipleRoundsOfFunding ?? false,
      enableLienTransfers: formValue.enableLienTransfers ?? false,
      isManualPaymentRequestsAllowed: formValue.isManualPaymentRequestsAllowed ?? false,
      isFeeAutomationEnabled: formValue.isFeeAutomationEnabled ?? false,
      isClosingStatementAutomationEnabled: formValue.isClosingStatementAutomationEnabled ?? false,
      isPaymentAutomationEnabled: formValue.isPaymentAutomationEnabled ?? false,
      isLienImportAutomationEnabled: formValue.isLienImportAutomationEnabled ?? false,
    };

    // set default defenseApprovalRequired=true when QsfType selected as GrossToFirm
    if (isQsfGrossFirm && isQsfProductIdChanged) {
      currentData.defenseApprovalRequired = true;
    }
    this.store.dispatch(actions.updateCommonSettingsCurrentData({ currentData }));
  }

  public isLienResolutionSettingSetToYes(): boolean {
    return this.lienResolutionSetting?.statusId == ProjectScopeStatusEnum.Yes;
  }

  public isPaymentAutomationActionable(): boolean {
    if (this.commonSettings.currentData.qsfProductId !== QSFType.Enhanced && this.commonSettings.currentData.qsfProductId !== QSFType.GrossToFirm) {
      this.paymentAutomationTooltip = 'Project must be Enhanced or GTF to enable this setting.';
      return false;
    }

    if (this.commonSettings.currentData.qsfProductId === QSFType.GrossToFirm && !this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.GTFPaymentAutomation))) {
      this.paymentAutomationTooltip = 'Feature Flag Permission for GTF Payment Automation must be set to action this feature.';
      return false;
    }

    if (this.commonSettings.currentData.qsfProductId === QSFType.Enhanced && !this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.EnhancedPaymentAutomation))) {
      this.paymentAutomationTooltip = 'Feature Flag Permission for Enhanced Payment Automation must be set to action this feature.';
      return false;
    }

    return true;
  }

  private setValidation() {
    this.formValid.emit({
      formId: LedgerSetttingsFormSections.CommonSettings,
      valid: this.validate(),
    });
  }
}
