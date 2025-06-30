import { createAction, props } from '@ngrx/store';

import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { MedicalLiensOverviewItem } from '@app/models/medical-liens-overview-item';

const featureName = `[Medical Liens List]`;
export const GetMedicalLiensList = createAction(`${featureName} Get Medical Liens List`, props<{ claimantId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetMedicalLiensListComplete = createAction(`${featureName} Get Medical Liens List Complete`, props<{ medicalLiens: MedicalLiensOverviewItem[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const Error = createAction(`${featureName} Error`, props<{ errorMessage: string }>());
