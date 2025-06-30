import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as BankAccountsReducer from './reducer';

const selectFeature = createFeatureSelector<BankAccountsReducer.BankAccountsState>('bankAccounts');
export const index = createSelector(selectFeature, state => state.index);
export const itemDetailsHeader = createSelector(selectFeature, state => state.itemDetailsHeader);
export const item = createSelector(selectFeature, state => state.item);
export const error = createSelector(selectFeature, state => state.error);
export const actionBar = createSelector(selectFeature, state => state.actionBar);
export const headerTitle = createSelector(selectFeature, state => state.headerTitle);
export const isAccountNumberLoaded = createSelector(selectFeature, state => state.isAccountNumberLoaded);
export const isFfcAccountLoaded = createSelector(selectFeature, state => state.isFfcAccountLoaded);
export const bankAccountSettings = createSelector(selectFeature, state => state.bankAccountSettings);
