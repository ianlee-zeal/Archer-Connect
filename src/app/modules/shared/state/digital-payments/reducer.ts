import { IdValue } from '@app/models';
import { Action, createReducer, on } from '@ngrx/store';
import * as actions from './actions';

export interface DigitalPaymentState {
  digitalProviderStatuses: IdValue[];
  error: string | null;
}

export const digitalPaymentState: DigitalPaymentState = {
  digitalProviderStatuses: [],
  error: null,
};

export const sharedDigitalPaymentsReducer = createReducer(
  digitalPaymentState,

  on(actions.GetDigitalProviderStatusesSuccess, (state: DigitalPaymentState, { digitalProviderStatuses }: { digitalProviderStatuses: IdValue[] }) => ({ ...state, digitalProviderStatuses, error: null })),
);

export function SharedDigitalPaymentsReducer(state: DigitalPaymentState | undefined, action: Action): DigitalPaymentState {
  return sharedDigitalPaymentsReducer(state, action);
}
