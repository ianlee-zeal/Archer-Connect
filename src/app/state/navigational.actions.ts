import { createAction, props } from '@ngrx/store';

export const NavigateToProjectDisbursementGroupsTab = createAction('[Root] Navigate To Project Disbursement Groups Tab', props<{ projectId: number }>());
