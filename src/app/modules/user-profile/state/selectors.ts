import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IUserProfileState } from './reducer';

const selectFeature = createFeatureSelector<IUserProfileState>('user-profile');

export const actionBar = createSelector(selectFeature, state => state.actionBar);
export const userProfile = createSelector(selectFeature, state => state.userProfile);
export const userProfileSettings = createSelector(selectFeature, state => state.userSettings);
export const countriesPhoneCodes = createSelector(selectFeature, state => state.countriesPhoneCodes);
export const error = createSelector(selectFeature, state => state.error);
