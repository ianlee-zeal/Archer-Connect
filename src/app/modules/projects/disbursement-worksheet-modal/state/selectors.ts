import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DeficiencySummaryOption } from '@app/models/documents/document-generators/deficiency-summary-option';
import { DisbursementWorksheetModalCommonState } from './reducer';

const projectsFeature = createFeatureSelector<DisbursementWorksheetModalCommonState>('disbursement_worksheet_modal');
const selectFeature = createSelector(projectsFeature, (state: DisbursementWorksheetModalCommonState) => state);

export const criticalDwDeficiencies = createSelector(selectFeature, (state: DisbursementWorksheetModalCommonState) => state.dwDeficienciesSummary?.filter((def: DeficiencySummaryOption) => def.severe && !def.other));
export const warningDwDeficiencies = createSelector(selectFeature, (state: DisbursementWorksheetModalCommonState) => state.dwDeficienciesSummary?.filter((def: DeficiencySummaryOption) => !def.severe && !def.other));
export const otherDwDeficienciesw = createSelector(selectFeature, (state: DisbursementWorksheetModalCommonState) => state.dwDeficienciesSummary?.filter((def: DeficiencySummaryOption) => def.other));
