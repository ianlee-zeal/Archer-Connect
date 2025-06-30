import { createReducer, on, Action } from '@ngrx/store';

import * as addressVerificationModalActions from './actions';
import {
  AddressMoveCheckConfiguration,
  AddressVerificationConfiguration,
  VerifiedAddress,
  AddressMoveCheckResult,
} from '@app/models/address';
import { IdValue } from '@app/models';

export interface AddressVerificationModalState {
  error: any;
  pending: boolean;

  showVerify: boolean;
  verifyConfiguration: AddressVerificationConfiguration;
  verifiedAddress: VerifiedAddress;
  useVerifiedAddress: boolean;
  runVerify: boolean;

  showMoveCheck: boolean;
  moveCheckConfiguration: AddressMoveCheckConfiguration;
  moveCheckResults: AddressMoveCheckResult[];
  runMoveCheck: boolean;

  dropdownValues: {
    thirdPartyProviders: IdValue[];
    moveCheckMonthsRequested: IdValue[];
  };
}

export const initialState: AddressVerificationModalState = {
  error: null,
  pending: false,

  showVerify: false,
  verifyConfiguration: new AddressVerificationConfiguration({
    includeName: true,
    advancedAddressCorrection: true,
  }),
  verifiedAddress: new VerifiedAddress(),
  useVerifiedAddress: false,
  runVerify: false,

  showMoveCheck: false,
  moveCheckConfiguration: new AddressMoveCheckConfiguration({
    monthsRequested: { id: 4, name: '48' },
  }),
  moveCheckResults: {} as AddressMoveCheckResult[],
  runMoveCheck: false,

  dropdownValues: null,
};

// main reducer function
const addressVerificationModalReducer = createReducer(
  initialState,
  on(addressVerificationModalActions.ModalError, (state, { errorMessage }) => ({
    ...state,
    pending: false,
    error: errorMessage,
  })),

  on(addressVerificationModalActions.CloseModal, state => ({
    ...state,
    showVerify: false,
    verifiedAddress: new VerifiedAddress(),
    useVerifiedAddress: false,
    runVerify: false,
    showMoveCheck: false,
    moveCheckResults: {} as AddressMoveCheckResult[],
    runMoveCheck: false,
  })),

  on(addressVerificationModalActions.LoadDefaultData, () => ({
    ...initialState,
  })),

  on(addressVerificationModalActions.UseVerifiedAddress, (state, { useVerifiedAddress }) => ({ ...state, useVerifiedAddress })),

  on(addressVerificationModalActions.VerifySuccess, (state, { verifiedAddress }) => ({
    ...state,
    verifiedAddress,
    error: null,
  })),

  on(addressVerificationModalActions.VerifyAddressSuccess, (state, { verifiedAddress }) => ({
    ...state,
    verifiedAddress,
    showVerify: true,
    runVerify: true,
  })),

  on(addressVerificationModalActions.MoveCheckAddressSuccess, (state, { moveCheckResults }) => ({
    ...state,
    moveCheckResults,
    showMoveCheck: true,
    runMoveCheck: true,
  })),

  on(addressVerificationModalActions.SaveMoveCheckAddressRequest, (state, { address }) => ({
    ...state,
    moveCheckResults: state.moveCheckResults.filter(obj => obj !== address),
  })),

  on(addressVerificationModalActions.LoadDefaultDataComplete, (state, { data }) => ({
    ...state,
    dropdownValues: data[0],
  })),

  on(addressVerificationModalActions.ClearError, state => ({
    ...state,
    error: null,
  })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function AddressVerificationModalReducer(state: AddressVerificationModalState | undefined, action: Action) {
  return addressVerificationModalReducer(state, action);
}
