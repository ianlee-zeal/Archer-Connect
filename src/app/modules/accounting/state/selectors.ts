import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAccounting from './reducer';

const accountingFeature = createFeatureSelector<fromAccounting.AccountingState>('accounting_feature');
const commonFeature = createSelector(accountingFeature, state => state.common);

export const actionBar = createSelector(commonFeature, state => state.actionBar);

export const error = createSelector(commonFeature, state => state.error);
