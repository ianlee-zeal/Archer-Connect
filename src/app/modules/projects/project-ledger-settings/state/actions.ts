import { createAction, props } from '@ngrx/store';

import { Project, IdValue } from '@app/models';
import { ElectronicDeliveryProvider } from '@app/models/enums/ledger-settings/electronicDeliveryProvider';
import { FormulaSets } from '@app/models/formula/formula-sets';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings/claim-settlement-ledger-settings';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ClaimSettlementCurrentData } from '@app/models/ledger-settings/ledger-settings-current-data';
import { ClosingStatementTemplatesListItem } from '@app/models/closing-statement/closing-statement-templates-list-item';
import { FileImportTemplateTypes } from '@app/models/enums';

export const featureName = '[LedgerSettings]';

export const Back = createAction(`${featureName} Back`, props<{ projectId: number }>());
export const Error = createAction(`${featureName} Document Error`, props<{ error: any }>());

export const LoadData = createAction(`${featureName} Load Data`, props<{ projectId: number, isProjectAssociated?: boolean }>());
export const LoadDataComplete = createAction(`${featureName} Load Data Complete`, props<{ claimSettlementLedgerSettings: ClaimSettlementLedgerSettings, documentImportTemplates: Record<FileImportTemplateTypes, IdValue[]>, formulaSets: FormulaSets[], electronicDeliveryProviders: IdValue[], qsfProducts: IdValue[], closingStatementTemplates: ClosingStatementTemplatesListItem[], formulaModes?: IdValue[], firmMoneyMovementOptions: IdValue[], digitalPaymentProvidersOptions: IdValue[] }>());

export const LoadOnlyClosingStatementSettings = createAction(`${featureName} Load Only Closing Statement Settings`, props<{ projectId: number, isProjectAssociated?: boolean }>());
export const LoadOnlyClosingStatementSettingsComplete = createAction(`${featureName} Load Only Closing Statement Settings Complete`, props<{ claimSettlementLedgerSettings: ClaimSettlementLedgerSettings }>());

export const updateClosingStatementSettingsCurrentData = createAction(`${featureName} Update Closing Statement Settings Current Data`, props<{ closingStatementTemplateId?: number, firmApprovedTemplate?: boolean, exportDetailedDisbursementWorksheetTemplateId?: number, exportFirmFeeAndExpenseTemplateId?: number }>());

export const setDefaultDigitalPaymentsSettings = createAction(`${featureName} Load Digital Payment Settings Default`, props<{ digitalPaymentProvidersOptions?: SelectOption[] }>());
export const updateDigitalPaymentsSettingsCurrentData = createAction(`${featureName} Update Digital Payment Settings Current Data`, props<{ isDigitalPaymentsEnabled: boolean, digitalPaymentProviderId: number }>());

export const setDefaultDeliverySettings = createAction(`${featureName} Load MDL Settings Default`, props<{ electronicDeliveryProviderOptions?: SelectOption[] }>());
export const updateDeliverySettingsCurrentData = createAction(`${featureName} Update Delivery Settings Current Data`, props<{ electionFormRequired: boolean, closingStatementEnabledPostal: boolean, closingStatementElectronicDeliveryEnabled: boolean, closingStatementElectronicDeliveryProviderId: ElectronicDeliveryProvider }>());

export const updateFormulaSettingsCurrentData = createAction(`${featureName} Update Formula Settings Current Data`, props<{ formulaSetId: number, formulaModeId: number }>());
export const filterFormulaCalculationStepOptions = createAction(`${featureName} Filter Formula Calculation Step Options`, props<{ formulaSetId: number }>());

export const CreateOrUpdateClaimantSettlementLedgerSettings = createAction(`${featureName} Create or Update Ledger Settings`, props<{ claimSettlementLedgerSettings: ClaimSettlementLedgerSettings, isProjectAssociated?: boolean }>());
export const CreateOrUpdateLedgerSettingsComplete = createAction(`${featureName} Create or Update Ledger Settings Complete`, props<{ claimSettlementLedgerSettings: ClaimSettlementLedgerSettings }>());

export const SetProject = createAction(`${featureName} Set Project`, props<{ projectObject: Project }>());

export const updateCommonSettingsCurrentData = createAction(`${featureName} Update Common Settings Current Data`, props<{ currentData: ClaimSettlementCurrentData }>());

export const updateFirmMoneyMovementCurrentData = createAction(`${featureName} Update Firm Money Movement Current Data`, props<{ firmMoneyMovementValues: any }>());
export const clearCurrentData = createAction(`${featureName} Clear Current Data`);
