import { BankAccountSettings } from '@app/models/bank-account-settings';
import { Action, createReducer, on } from '@ngrx/store';
import { DocumentValidationResult } from '@app/models/upload-w9/document-validation-result';
import * as actions from './actions';

export interface UploadW9State {
  uploading: boolean;
  w9Settings: BankAccountSettings;
  result: DocumentValidationResult | null;
  error: any | null;
}

export const uploadW9InitialState: UploadW9State = {
  uploading: true,
  w9Settings: null,
  result: null,
  error: null,
};

const uploadW9Reducer = createReducer(
  uploadW9InitialState,
  on(actions.UploadW9, (state: UploadW9State) => ({ ...state, uploading: true, result: null })),
  on(actions.UploadW9Success, (state: UploadW9State, { result }: { result: DocumentValidationResult }) => ({ ...state, uploading: false, result })),
  on(actions.UploadW9Error, (state: UploadW9State, { errorMessage }: { errorMessage: string }) => ({ ...state, uploading: false, error: errorMessage })),
  on(actions.GetW9SettingsSuccess, (state: UploadW9State, { data }: { data: BankAccountSettings }) => ({ ...state, w9Settings: data })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function UploadW9Reducer(state: UploadW9State | undefined, action: Action): UploadW9State {
  return uploadW9Reducer(state, action);
}
