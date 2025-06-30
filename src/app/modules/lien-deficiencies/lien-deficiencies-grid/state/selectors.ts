import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LienDeficienciesState } from '../../state/reducer';

const feature = createFeatureSelector<LienDeficienciesState>('lien_deficiencies_feature');
const LienDeficienciesGridState = createSelector(feature, state => state.lienDeficiencies.grid);

export const lienDeficienciesGridSelectors = {
  list: createSelector(LienDeficienciesGridState, state => state.list),
  agGridParams: createSelector(LienDeficienciesGridState, state => state.agGridParams),
  error: createSelector(LienDeficienciesGridState, state => state.error),
  runIntegrationJob: createSelector(LienDeficienciesGridState, state => state.runIntegrationJob),
  isRunStarted: createSelector(LienDeficienciesGridState, state => state.isRunStarted),
};
