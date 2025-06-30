import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromProjects from '../../state/reducer';
import { LedgerSettingsState } from './reducer';

const projectsFeature = createFeatureSelector<fromProjects.ProjectsState>('projects_feature');
const claimantSettlementLedgerSettingsFeature = createSelector(projectsFeature, (state: fromProjects.ProjectsState) => state.claimantSettlementLedgerSettings);

export const claimantSettlementLedgerSettingState = createSelector(claimantSettlementLedgerSettingsFeature, (state: LedgerSettingsState) => state);

export const claimantSettlementLedgerSettingsSelectors = { root: claimantSettlementLedgerSettingsFeature };

export const commonSettings = createSelector(claimantSettlementLedgerSettingsFeature, (state: LedgerSettingsState) => state.commonSettings);
export const closingStatementSettings = createSelector(claimantSettlementLedgerSettingsFeature, (state: LedgerSettingsState) => state.closingStatementSettings);
export const closingStatementTemplateId = createSelector(claimantSettlementLedgerSettingsFeature, (state: LedgerSettingsState) => state.closingStatementSettings.currentData.closingStatementTemplateId);
export const formulaSettings = createSelector(claimantSettlementLedgerSettingsFeature, (state: LedgerSettingsState) => state.formulaSettings);
export const deliverySettings = createSelector(claimantSettlementLedgerSettingsFeature, (state: LedgerSettingsState) => state.deliverySettings);
export const firmMoneyMovement = createSelector(claimantSettlementLedgerSettingsFeature, (state: LedgerSettingsState) => state.firmMoneyMovement);
export const digitalPaymentSettings = createSelector(claimantSettlementLedgerSettingsFeature, (state: LedgerSettingsState) => state.digitalPaymentSettings);
