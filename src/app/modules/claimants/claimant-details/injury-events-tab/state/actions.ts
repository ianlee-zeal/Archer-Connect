import { createAction, props } from '@ngrx/store';
import { InjuryEvent } from '@app/models/injury-event';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';


export const Error = createAction('[Injury Events List] Injury Events API Error', props<{ errorMessage: string }>());

export const GetInjuryEventsList = createAction('[Injury Events List] Get Injury Events List', props<{ claimantId: number, params: IServerSideGetRowsParamsExtended }>());
export const GetInjuryEventsListComplete = createAction('[Injury Events List] Get Injury Events List Complete', props<{ injuryEvents: InjuryEvent[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number}>());

export const SaveInjuryEvent = createAction('[Add Injury Events Modal] Save Injury Event', props<{ injuryEvent: InjuryEvent, successCallback: () => void }>());

export const DeleteInjuryEvent = createAction('[Add Injury Events Modal] Delete Injury Event', props<{ injuryEvent: InjuryEvent, successCallback: () => void }>());
export const DeleteInjuryEventComplete = createAction('[Add Injury Events Modal] Delete Injury Event Complete');

export const RefreshInjuryEventsList = createAction('[Add Injury Events Modal] Refresh Injury Events', props<{ claimantId: number }>());
