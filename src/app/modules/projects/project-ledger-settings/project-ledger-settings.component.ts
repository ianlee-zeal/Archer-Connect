import { Component, OnDestroy, OnInit } from '@angular/core';

import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ActionsSubject, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings/claim-settlement-ledger-settings';
import * as commonActions from 'src/app/modules/projects/state/actions';
import { Project } from '@app/models';
import { UntypedFormGroup } from '@angular/forms';
import { LedgerSetttingsFormSections } from '@app/models/enums/ledger-settings/form-sections';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { PermissionService } from '@app/services';
import { FirmMoneyMovementDefaultValues } from '@app/services/firm-money-movement-default-values.service';
import { PercentageHelper } from '@app/helpers';
import cloneDeep from 'lodash-es/cloneDeep';
import * as actions from './state/actions';
import * as selectors from './state/selectors';
import * as fromProjects from '../state';
import * as projectSelectors from '../state/selectors';
import { LedgerSettingsState } from './state/reducer';
import { ofType } from '@ngrx/effects';

@Component({
  selector: 'app-project-ledger-settings',
  templateUrl: './project-ledger-settings.component.html',
  styleUrls: ['./project-ledger-settings.component.scss'],
})
export class ProjectLedgerSettings implements OnInit, OnDestroy {
  public readonly entityTypeId = EntityTypeEnum.Projects;
  private readonly ngUnsubscribe$ = new Subject<void>();

  public readonly project$ = this.store.select(projectSelectors.item);
  public readonly actionBar$ = this.store.select(projectSelectors.actionBar);
  public readonly claimantSettlementLedgerSettingState$ = this.store.select(selectors.claimantSettlementLedgerSettingState);
  public readonly canViewPaymentAutomationPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.GTFPaymentAutomation)) || this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.EnhancedPaymentAutomation));
  public readonly hasLienImportAutomationPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.LienImportAutomation));
  public canViewLienImportAutomationPermission = false;

  public projectId: number;

  public get isLedgerSettingsEdited(): boolean {
    return this.hasFormChanges && !!this.claimantSettlementLedgerSettingState.data.claimSettlementLedgerSettings?.id;
  }

  private readonly actionBar: ActionHandlersMap = {
    save: {
      callback: () => this.onSave(),
      disabled: () => !this.isFormValid() || !this.isLedgerSettingsEdited,
      hidden: () => !this.canEdit,
      awaitedActionTypes: [
        actions.CreateOrUpdateLedgerSettingsComplete.type,
        actions.Error.type,
      ],
    },
    cancel: {
      callback: () => this.onCancel(),
      hidden: () => !this.canEdit,
    },
    edit: {
      callback: () => this.edit(),
      hidden: () => this.canEdit,
      permissions: PermissionService.create(PermissionTypeEnum.LedgerSettings, PermissionActionTypeEnum.Edit),
    },
  };

  public canEdit = false;
  public claimantSettlementLedgerSettingState: LedgerSettingsState;
  public initialSettings: LedgerSettingsState;
  public hasFormChanges: boolean = false;

  public childForms = {
    [LedgerSetttingsFormSections.ClosingStatement]: null,
    [LedgerSetttingsFormSections.CommonSettings]: null,
    [LedgerSetttingsFormSections.DeliverySettings]: null,
    [LedgerSetttingsFormSections.FormulaSettings]: null,
    [LedgerSetttingsFormSections.FirmMoneyMovement]: null,
    [LedgerSetttingsFormSections.DigitalPaymentSettings]: null,
  };

  public form: UntypedFormGroup;

  constructor(
    private readonly store: Store<fromProjects.AppState>,
    private defaultValues: FirmMoneyMovementDefaultValues,
    private readonly actionsSubj: ActionsSubject,
    private readonly permissionService: PermissionService,
  ) { }

  ngOnInit() {
    this.store.dispatch(
      commonActions.UpdateActionBar({ actionBar: this.actionBar }),
    );
    this.loadSubscriptions();
  }

  public ngOnDestroy(): void {
    this.store.dispatch(commonActions.UpdateActionBar({ actionBar: null }));
    this.store.dispatch(actions.clearCurrentData());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  edit(): void {
    this.canEdit = !this.canEdit;
  }

  defaultLoad(projectItem: Project) {
    this.projectId = projectItem.id;
    this.store.dispatch(actions.SetProject({ projectObject: projectItem }));
    this.store.dispatch(actions.LoadData({ projectId: this.projectId, isProjectAssociated: true }));
  }

  loadSubscriptions() {
    this.claimantSettlementLedgerSettingState$
      .pipe(
        filter(x => !!x),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(item => {
        this.canViewLienImportAutomationPermission = item.commonSettings.currentData.isLienImportAutomationPermissionEnabled && this.hasLienImportAutomationPermission;
        this.claimantSettlementLedgerSettingState = item;
      });

    this.claimantSettlementLedgerSettingState$
      .pipe(
        filter(x => !!x && x.isLoadDataComplete),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(item => {
        if (!this.initialSettings) {
          this.initialSettings = cloneDeep(item);
        }

        if (!item.firmMoneyMovement.currentData.settlementCounselPaymentOrgTypeId
          && !item.firmMoneyMovement.currentData.primaryFirmPaymentOrgTypeId
          && !item.firmMoneyMovement.currentData.referingFirmPaymentOrgTypeId
          && item.commonSettings.currentData.qsfProductId) {
          const firmMoneyMovementValues = this.defaultValues.updateDefaultValues(item.commonSettings.currentData.qsfProductId);
          this.store.dispatch(actions.updateFirmMoneyMovementCurrentData({ firmMoneyMovementValues }));
        }
      });
    this.project$
      .pipe(
        filter(x => !!x),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(itemProject => {
        this.defaultLoad(itemProject);
      });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.CreateOrUpdateLedgerSettingsComplete,
      ),
    ).subscribe(() => {
      this.canEdit = false;
    });
  }

  checkedElectionFormRequired(): boolean {
    return this.claimantSettlementLedgerSettingState.data.claimSettlementLedgerSettings?.id ? this.claimantSettlementLedgerSettingState.deliverySettings.currentData.electionFormRequired : true;
  }

  private onCancel(): void {
    this.canEdit = false;
    this.clearForm();
  }

  onSave() {
    if (!this.isFormValid()) {
      return;
    }

    const claimSettlementLedgerSettings: ClaimSettlementLedgerSettings = {
      id: this.claimantSettlementLedgerSettingState.data.claimSettlementLedgerSettings?.id,
      entityId: this.claimantSettlementLedgerSettingState.project.id,
      entityTypeId: EntityTypeEnum.Projects,
      productId: this.claimantSettlementLedgerSettingState.commonSettings.currentData.qsfProductId,
      netAllocationThreshold: this.claimantSettlementLedgerSettingState.commonSettings.currentData.netAllocationThreshold,
      formulaSetId: this.claimantSettlementLedgerSettingState.formulaSettings.currentData.formulaSetId,
      formulaModeId: this.claimantSettlementLedgerSettingState.formulaSettings.currentData.formulaModeId,
      formulaVersion: this.claimantSettlementLedgerSettingState.formulaSettings.currentData.formulaVersion,
      exportDetailedDisbursementWorksheetTemplateId: this.claimantSettlementLedgerSettingState.closingStatementSettings.currentData.exportDetailedDisbursementWorksheetTemplateId,
      exportFirmFeeAndExpenseTemplateId: this.claimantSettlementLedgerSettingState.closingStatementSettings.currentData.exportFirmFeeAndExpenseTemplateId,
      closingStatementTemplateId: this.claimantSettlementLedgerSettingState.closingStatementSettings.currentData.closingStatementTemplateId,
      firmApprovedTemplate: this.claimantSettlementLedgerSettingState.closingStatementSettings.currentData.firmApprovedTemplate,
      electionFormRequired: this.claimantSettlementLedgerSettingState.deliverySettings.currentData.electionFormRequired,
      closingStatementEnabledPostal: this.claimantSettlementLedgerSettingState.deliverySettings.currentData.closingStatementEnabledPostal,
      closingStatementElectronicDeliveryEnabled: this.claimantSettlementLedgerSettingState.deliverySettings.currentData.closingStatementElectronicDeliveryEnabled,
      closingStatementElectronicDeliveryProviderId: this.claimantSettlementLedgerSettingState.deliverySettings.currentData.closingStatementElectronicDeliveryProviderId,
      settlementCounselPaymentOrgTypeId: this.claimantSettlementLedgerSettingState.firmMoneyMovement.currentData.settlementCounselPaymentOrgTypeId,
      primaryFirmPaymentOrgTypeId: this.claimantSettlementLedgerSettingState.firmMoneyMovement.currentData.primaryFirmPaymentOrgTypeId,
      referingFirmPaymentOrgTypeId: this.claimantSettlementLedgerSettingState.firmMoneyMovement.currentData.referingFirmPaymentOrgTypeId,
      specialInstructions: this.claimantSettlementLedgerSettingState.firmMoneyMovement.currentData.specialInstructions,
      lienPaymentsOrganization: this.claimantSettlementLedgerSettingState.commonSettings.currentData.lienPaymentsOrganization,
      lienPaymentsOrgId: this.claimantSettlementLedgerSettingState.commonSettings.currentData.lienPaymentsOrganization?.id,
      defenseApprovalRequired: this.claimantSettlementLedgerSettingState.commonSettings.currentData.defenseApprovalRequired,
      multipleRoundsOfFunding: this.claimantSettlementLedgerSettingState.commonSettings.currentData.multipleRoundsOfFunding,
      isDigitalPaymentsEnabled: this.claimantSettlementLedgerSettingState.digitalPaymentSettings.currentData.isDigitalPaymentsEnabled,
      digitalPaymentProviderId: this.claimantSettlementLedgerSettingState.digitalPaymentSettings.currentData.digitalPaymentProviderId,
      enableLienTransfers: this.claimantSettlementLedgerSettingState.commonSettings.currentData.enableLienTransfers,
      isManualPaymentRequestsAllowed: this.claimantSettlementLedgerSettingState.commonSettings.currentData.isManualPaymentRequestsAllowed,
      isFeeAutomationEnabled: this.claimantSettlementLedgerSettingState.commonSettings.currentData.isFeeAutomationEnabled,
      isClosingStatementAutomationEnabled: this.claimantSettlementLedgerSettingState.commonSettings.currentData.isClosingStatementAutomationEnabled,
      isPaymentAutomationEnabled: this.claimantSettlementLedgerSettingState.commonSettings.currentData.isPaymentAutomationEnabled,
      isLienImportAutomationEnabled: this.claimantSettlementLedgerSettingState.commonSettings.currentData.isLienImportAutomationEnabled,
      isLienImportAutomationPermissionEnabled: this.claimantSettlementLedgerSettingState.commonSettings.currentData.isLienImportAutomationPermissionEnabled,
    } as ClaimSettlementLedgerSettings;

    this.store.dispatch(actions.CreateOrUpdateClaimantSettlementLedgerSettings({ claimSettlementLedgerSettings, isProjectAssociated: true }));
    this.hasFormChanges = false;
  }

  private clearForm(): void {
    this.store.dispatch(actions.updateClosingStatementSettingsCurrentData({
      closingStatementTemplateId: this.initialSettings.closingStatementSettings.currentData.closingStatementTemplateId,
      firmApprovedTemplate: this.initialSettings.closingStatementSettings.currentData.firmApprovedTemplate,
      exportDetailedDisbursementWorksheetTemplateId: this.initialSettings.closingStatementSettings.currentData.exportDetailedDisbursementWorksheetTemplateId,
      exportFirmFeeAndExpenseTemplateId: this.initialSettings.closingStatementSettings.currentData.exportFirmFeeAndExpenseTemplateId,
    }));
    this.store.dispatch(actions.updateFormulaSettingsCurrentData({
      formulaModeId: this.initialSettings.formulaSettings.currentData.formulaModeId ?? +(this.initialSettings.formulaSettings.formulaModeIdOptions[0]?.id || null),
      formulaSetId: this.initialSettings.formulaSettings.currentData.formulaSetId ?? +(this.initialSettings.formulaSettings.formulaSetIdOptions[0]?.id || null),
    }));
    this.store.dispatch(actions.updateDeliverySettingsCurrentData({
      electionFormRequired: this.initialSettings.deliverySettings.currentData.electionFormRequired,
      closingStatementEnabledPostal: this.initialSettings.deliverySettings.currentData.closingStatementEnabledPostal,
      closingStatementElectronicDeliveryEnabled: this.initialSettings.deliverySettings.currentData.closingStatementElectronicDeliveryEnabled,
      closingStatementElectronicDeliveryProviderId: this.initialSettings.deliverySettings.currentData.closingStatementElectronicDeliveryProviderId,
    }));
    this.store.dispatch(actions.updateCommonSettingsCurrentData({
      currentData: {
        qsfProductId: this.initialSettings.commonSettings.currentData.qsfProductId,
        netAllocationThreshold: this.initialSettings.commonSettings.currentData.netAllocationThreshold,
        isQsfServiceChanged: this.initialSettings.commonSettings.currentData.isQsfServiceChanged,
        lienPaymentsOrganization: this.initialSettings.commonSettings.currentData.lienPaymentsOrganization,
        defenseApprovalRequired: this.initialSettings.commonSettings.currentData.defenseApprovalRequired,
        multipleRoundsOfFunding: this.initialSettings.commonSettings.currentData.multipleRoundsOfFunding,
        enableLienTransfers: this.initialSettings.commonSettings.currentData.enableLienTransfers,
        isManualPaymentRequestsAllowed: this.initialSettings.commonSettings.currentData.isManualPaymentRequestsAllowed,
        isFeeAutomationEnabled: this.initialSettings.commonSettings.currentData.isFeeAutomationEnabled,
        isClosingStatementAutomationEnabled: this.initialSettings.commonSettings.currentData.isClosingStatementAutomationEnabled,
        isPaymentAutomationEnabled: this.initialSettings.commonSettings.currentData.isPaymentAutomationEnabled,
        isLienImportAutomationEnabled: this.initialSettings.commonSettings.currentData.isLienImportAutomationEnabled,
        isLienImportAutomationPermissionEnabled: this.initialSettings.commonSettings.currentData.isLienImportAutomationPermissionEnabled,
      },
    }));
    this.store.dispatch(actions.updateFirmMoneyMovementCurrentData({
      firmMoneyMovementValues: {
        primaryFirmPayments: this.initialSettings.firmMoneyMovement.currentData.primaryFirmPaymentOrgTypeId,
        referingFirmPayments: this.initialSettings.firmMoneyMovement.currentData.referingFirmPaymentOrgTypeId,
        settlementCounselPayments: this.initialSettings.firmMoneyMovement.currentData.settlementCounselPaymentOrgTypeId,
        specialInstructions: this.initialSettings.firmMoneyMovement.currentData.specialInstructions,
      },
    }));
    this.store.dispatch(actions.updateDigitalPaymentsSettingsCurrentData({
      isDigitalPaymentsEnabled: this.initialSettings.digitalPaymentSettings.currentData.isDigitalPaymentsEnabled,
      digitalPaymentProviderId: this.initialSettings.digitalPaymentSettings.currentData.digitalPaymentProviderId,
    }));
  }

  public formChanged(): void {
    this.hasFormChanges = true;
  }

  private isFormValid(): boolean {
    return Object.keys(this.childForms).every(i => this.childForms[i] !== null) ? Object.keys(this.childForms).every(i => this.childForms[i]) : true;
  }

  public onFormValid(data: { formId: LedgerSetttingsFormSections, valid: boolean }): void {
    this.childForms[data.formId] = data.valid;
  }

  public getPipedPercent(value: number): string {
    return PercentageHelper.toFractionPercentage(value, 8);
  }

  getQSFProductIdOption(qsfProductId: number): SelectOption {
    const selectedOptions = this.claimantSettlementLedgerSettingState?.commonSettings?.qsfProductOptions?.filter(i => i.id === qsfProductId);
    const qsfProductIdOption: SelectOption = selectedOptions && selectedOptions.length > 0 ? selectedOptions[0] : null;
    return qsfProductIdOption;
  }

  filterFromSelectOptions(options: SelectOption[], id: number): SelectOption {
    if (!!options && options.length > 0) {
      const selectedOptions = options?.filter(i => i.id === id);
      const option: SelectOption = selectedOptions.length > 0 ? selectedOptions[0] : null;
      return option;
    }
    return null;
  }

  public getFeeAutomationValueWithHint(isEnabled: boolean): string {
    return `${isEnabled ? 'Yes' : 'No'}\u00A0\u00A0\u00A0View and update ‘Fee Import Automation’ settings in Chart of Accounts tab`;
  }
}
