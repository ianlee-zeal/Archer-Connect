import { createReducer, on, Action } from '@ngrx/store';

import { IdValue } from '@app/models/idValue';
import { LienFinalizationRun } from '@app/models/lien-finalization/lien-finalization-run';
import { LienProcessingStatus } from '@app/models/lien-finalization/lien-processing-status.enum';

import * as actions from './actions';

export interface LienProcessingModalState {
  error: string;
  isClosingDisabled: boolean,

  status: LienProcessingStatus,
  lienFinalizationRun: LienFinalizationRun,

  dropdownValues: { collectors: IdValue[] },
}

export const lienProcessingModalState: LienProcessingModalState = {
  error: null,
  isClosingDisabled: false,

  status: LienProcessingStatus.None,
  lienFinalizationRun: LienFinalizationRun.toModel({}),

  dropdownValues: { collectors: null },
};

const Reducer = createReducer(
  lienProcessingModalState,

  on(actions.Error, (state, { error }) => ({ ...state, error })),

  on(actions.GetDropdownValuesSuccess, (state, { collectors }) => ({
    ...state,
    dropdownValues: { ...state.dropdownValues, collectors },
  })),

  on(actions.SetSettings, (state, { settings }) => ({
    ...state,
    lienFinalizationRun: {
      ...state.lienFinalizationRun,
      collectorOrg: {
        ...state.lienFinalizationRun?.collectorOrg,
        id: settings?.collectorOrg?.id,
        name: settings?.collectorOrg?.name,
      },
    },
  })),

  on(actions.StartFinalization, state => ({
    ...state,
    error: null,
    status: LienProcessingStatus.Start,
    isClosingDisabled: true,
  })),

  on(actions.RunReadyLiens, state => ({
    ...state,
    error: null,
  })),
  on(actions.CreateLienFinalizationSuccess, (state, { lienFinalizationRun }) => ({
    ...state,
    status: LienProcessingStatus.Finalize,
    lienFinalizationRun: {
      ...state.lienFinalizationRun,
      resultDocumentId: lienFinalizationRun.resultDocumentId,
      id: lienFinalizationRun.id,
    },
  })),

  on(actions.ResetLienProcessingModalState, state => ({
    ...state,
    lienFinalizationRun: LienFinalizationRun.toModel({}),
    error: null,
    status: LienProcessingStatus.None,
    isClosingDisabled: false,
  })),

  on(actions.ResetOnErrorState, state => ({
    ...state,
    lienFinalizationRun: {
      ...state.lienFinalizationRun,
      resultDocumentId: null,
    },
    status: LienProcessingStatus.None,
    isClosingDisabled: false,
  })),

  on(actions.ShowFoundLiens, (state, { resultDocId }) => ({
    ...state,
    lienFinalizationRun: {
      ...state.lienFinalizationRun,
      resultDocumentId: resultDocId,
    },
    status: LienProcessingStatus.None,
    isClosingDisabled: false,
  })),
);

export function reducer(state: LienProcessingModalState | undefined, action: Action) {
  return Reducer(state, action);
}
