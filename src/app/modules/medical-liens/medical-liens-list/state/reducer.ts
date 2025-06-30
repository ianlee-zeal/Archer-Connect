import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import * as medicalLiensListActions from './actions';
import { MedicalLiensOverviewItem } from '@app/models/medical-liens-overview-item';


export interface MedicalLiensListState {
  error: string,
  pending: boolean,
  agGridParams: IServerSideGetRowsParamsExtended,
  medicalLiens: MedicalLiensOverviewItem[],
}

const initialState: MedicalLiensListState = {
  error: null,
  pending: false,
  agGridParams: null,
  medicalLiens: null,
};


// main reducer function
const medicalLiensListReducer = createReducer(
  initialState,
  on(medicalLiensListActions.GetMedicalLiensList, (state, { claimantId, agGridParams }) => ({ ...state, pending: true, error: null, medicalLiens: null, claimantId, agGridParams })),

  on(medicalLiensListActions.Error, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

  on(medicalLiensListActions.GetMedicalLiensListComplete, (state, { medicalLiens }) => ({ ...state, medicalLiens, error: null })),
);


// we have to wrap our reducer like this or it won't compile in prod
export function MedicalLiensListReducer(state: MedicalLiensListState | undefined, action: Action) {
  return medicalLiensListReducer(state, action);
}
