import { BatchActionReviewOption } from '@app/models/batch-action/batch-action-review-option';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PaymentQueueState } from './reducer';

const paymentQueueFeature = createFeatureSelector<PaymentQueueState>('payment-queue_feature');
const selectFeature = createSelector(paymentQueueFeature, (state: PaymentQueueState) => state);

export const gridParams = createSelector(selectFeature, (state: PaymentQueueState) => state.common.gridParams);
export const actionBar = createSelector(selectFeature, (state: PaymentQueueState) => state.common.actionBar);
export const lienPaymentStageValidationResult = createSelector(selectFeature, (state: PaymentQueueState) => state.common.lienPaymentStageValidationResult);
export const specialPaymentInstructions = createSelector(selectFeature, (state: PaymentQueueState) => state.common.paymentInstructions);

export const advancedSearch = createSelector(selectFeature, (state: PaymentQueueState) => state.advancedSearch);
export const showExpandBtn = createSelector(selectFeature, (state: PaymentQueueState) => state.advancedSearch.showExpandBtn);

export const criticalDeficiencies = createSelector(selectFeature, (state: PaymentQueueState) => state.common.batchActionDeficienciesReview?.options.filter((def: BatchActionReviewOption) => def.severe));
export const warningDeficiencies = createSelector(selectFeature, (state: PaymentQueueState) => state.common.batchActionDeficienciesReview?.options.filter((def: BatchActionReviewOption) => !def.severe && !def.other));
