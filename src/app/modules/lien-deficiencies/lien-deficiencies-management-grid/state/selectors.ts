import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LienDeficienciesState } from '../../state/reducer';

const feature = createFeatureSelector<LienDeficienciesState>('lien_deficiencies_feature');
const LienDeficienciesGridState = createSelector(feature, state => state.lienDeficienciesManagement.grid);


export const lienDeficienciesGridSelectors = {
  list: createSelector(LienDeficienciesGridState, state => state.list),
  agGridParams: createSelector(LienDeficienciesGridState, state => state.agGridParams),
  deficiencyCategories: createSelector(LienDeficienciesGridState, state => state.deficiencyCategories),
  error: createSelector(LienDeficienciesGridState, state => state.error),
};
