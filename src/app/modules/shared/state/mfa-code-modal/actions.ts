import { createAction, props } from '@ngrx/store';
import { AuthyUpdateRequest } from '@app/models/users';

export const GetMfaCodeError = createAction('[Shared MFA Code] Ge Mfa Code Error', props<{ errorMessage: string }>());

export const SendMfaCodeRequest = createAction('[Shared MFA Code] Get Mfa Code Request', props<{ userGuid: string }>());
export const SendMfaCodeSuccess = createAction('[Shared MFA Code] Get Mfa Code Success');

export const SendMfaCodeRequestForNewAuthyUser = createAction('[Shared MFA Code] Get Mfa Code Request For New Authy User', props<{ request: AuthyUpdateRequest }>());
export const SendMfaCodeRequestForNewAuthyUserSuccess = createAction('[Shared MFA Code] Get Mfa Code Request For New Authy User Success', props<{ result: number }>());

export const SaveUserEnteredMfaCode = createAction('[Shared MFA Code] Save User Entered Mfa Code', props<{ code: string }>());
