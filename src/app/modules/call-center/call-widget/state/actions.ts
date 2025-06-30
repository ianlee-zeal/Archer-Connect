import { createAction, props } from '@ngrx/store';
import * as Models from '@app/models';

const FEATURE_NAME = '[Call-Widget]';

export const StartCall = createAction(`${FEATURE_NAME} Start Call`, props<{ callInfo: Models.CallInfo }>());
export const FinishCall = createAction(`${FEATURE_NAME} Finish Call`, props<{ communicationRecord: Models.CommunicationRecord }>());
export const FinishCallCompleted = createAction(`${FEATURE_NAME} Finish Call Completed`, props<{ callInfo: Models.CallInfo }>());

export const CancelCall = createAction(`${FEATURE_NAME} Cancel Call`);
export const UpdateCallInfo = createAction(`${FEATURE_NAME} Update Call Info`, props<{ callInfo: Models.CallInfo }>());
export const IncreaseCallDuration = createAction(`${FEATURE_NAME} Increase Call Duration`);

export const GetCommunicationDirectionListRequest = createAction(`${FEATURE_NAME} Get Communication Direction Request`);
export const GetCommunicationDirectionListSuccess = createAction(`${FEATURE_NAME} Get Communication Direction Success`, props<{ communicationDirections: Models.CommunicationDirection[] }>());

export const GetCommunicationPartyTypeListRequest = createAction(`${FEATURE_NAME} Get Communication Party Type Request`);
export const GetCommunicationPartyTypeListSuccess = createAction(`${FEATURE_NAME} Get Communication Party Type Success`, props<{ communicationParties: Models.CommunicationPartyType[] }>());

export const GetCommunicationResultListRequest = createAction(`${FEATURE_NAME} Get Communication Result List Request`, props<{ directionId: number, methodId: number }>());
export const GetCommunicationResultListSuccess = createAction(`${FEATURE_NAME} Get Communication Result List Success`, props<{ communicationResults: Models.CommunicationResult[] }>());

export const GetCommunicationSubjectListRequest = createAction(`${FEATURE_NAME} Get Communication Subject List Request`, props<{ directionId: number, methodId: number }>());
export const GetCommunicationSubjectListSuccess = createAction(`${FEATURE_NAME} Get Communication Subject List Success`, props<{ communicationSubjects: Models.CommunicationSubject[] }>());

export const ClearDropdownLists = createAction(`${FEATURE_NAME} Clear Dropdown Lists`);

export const Error = createAction(`${FEATURE_NAME} Error`, props<{ error: string }>());
