import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromPersons from './reducer';

const featureSelector = createFeatureSelector<fromPersons.PersonState>('persons_feature');

const common = createSelector(featureSelector, state => state.common);

export const error = createSelector(common, state => state.error);
export const actionBar = createSelector(common, state => state.actionBar);
export const persons = createSelector(common, state => state.persons);
export const prevPersonId = createSelector(common, state => state.prevPersonId);
export const personPreviousUrl = createSelector(common, state => state.personPreviousUrl);
export const agGridParams = createSelector(common, state => state.agGridParams);

export const advancedSearch = createSelector(featureSelector, state => state.advancedSearch);
