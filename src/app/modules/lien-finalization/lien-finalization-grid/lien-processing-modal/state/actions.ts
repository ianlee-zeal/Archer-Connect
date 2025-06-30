import { createAction, props } from '@ngrx/store';
import { IdValue } from '@app/models';
import { LienFinalizationRun } from '@app/models/lien-finalization/lien-finalization-run';
import * as lienFinalizationRunCreation from '@app/models/lien-finalization/lien-finalization-run-creation';

export const FEATURE_NAME = '[Lien Processing Modal]';

export const Error = createAction(`${FEATURE_NAME} Error`, props<{ error: any }>());

export const GetDropdownValues = createAction(`${FEATURE_NAME} Get Dropdown Values`);
export const GetDropdownValuesSuccess = createAction(`${FEATURE_NAME} Get Dropdown Values Success`, props<{ collectors: IdValue[] }>());

export const SetSettings = createAction(`${FEATURE_NAME} Set Settings`, props<{ settings: any }>());

export const ResetLienProcessingModalState = createAction(`${FEATURE_NAME} Reset Lien Processing Modal State`);

export const CreateLienFinalization = createAction(`${FEATURE_NAME} Create Lien Finaization`, props<{ collectorOrgId: number; }>());
export const CreateLienFinalizationSuccess = createAction(`${FEATURE_NAME} Create Lien Finalization Success`, props<{ lienFinalizationRun: LienFinalizationRun }>());

export const RunLienFinalization = createAction(`${FEATURE_NAME} Run Lien Finaization`, props<{ batchId:number, lienFinalizationRunCreation: lienFinalizationRunCreation.RunLienFinalization }>());
export const RunLienFinalizationSuccess = createAction(`${FEATURE_NAME} Run Lien Finalization Success`, props<{ lienFinalizationRun: LienFinalizationRun }>());

export const RunAcceptance = createAction(`${FEATURE_NAME} Run Acceptance `, props<{ batchId:number, lienFinalizationRunCreation: lienFinalizationRunCreation.RunLienFinalization }>());
export const RunAcceptanceSuccess = createAction(`${FEATURE_NAME} Run Acceptance Success`, props<{ lienFinalizationRun: LienFinalizationRun }>());

export const RunReadyLiens = createAction(`${FEATURE_NAME} Run Ready Liens `, props<{ batchId:number, lienFinalizationRunCreation: lienFinalizationRunCreation.RunLienFinalization }>());
export const RunReadyLiensSuccess = createAction(`${FEATURE_NAME} Run Ready Liens Success`, props<{ lienFinalizationRun: LienFinalizationRun }>());

export const StartFinalization = createAction(`${FEATURE_NAME} Start Finalization`);
export const ResetOnErrorState = createAction(`${FEATURE_NAME} Reset on Error`);
export const RefreshLienFinalizationGrid = createAction(`${FEATURE_NAME} Refresh Lien Finalization Grid`);

export const ShowLienFinalizationResults = createAction(`${FEATURE_NAME} Show Lien Finalization Results`, props<{ lienFinalizationRun: LienFinalizationRun }>());

export const ShowFoundLiens = createAction(`${FEATURE_NAME} Show Found Liens`, props<{ resultDocId: number }>());
