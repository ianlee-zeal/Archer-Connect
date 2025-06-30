import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FirmLandingPageState } from './reducer';

const selectFeature = createFeatureSelector<FirmLandingPageState>('firm_landing_page_feature');
export const idValueCases = createSelector(selectFeature, state => state.idValueCases);
export const globalDeficienciesCount = createSelector(selectFeature, state => state.globalDeficienciesCount);
export const projectDeficienciesCount = createSelector(selectFeature, state => state.projectDeficiencyCounts);