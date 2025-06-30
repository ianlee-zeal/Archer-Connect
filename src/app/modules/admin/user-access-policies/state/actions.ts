import { createAction, props } from '@ngrx/store';

import * as Models from '@app/models';

export const Error = createAction('[Admin-User-Orgs] Api Error', props<{ error: string }>());

export const GetOrgsGrid = createAction('[Admin-User-Orgs] Get Orgs Grid', props<{ params: any }>());
export const GetOrg = createAction('[Admin-User-Orgs] Get Org', props<{ id: number }>());
export const GetOrgComplete = createAction('[Admin-User-Orgs] Get Org Complete', props<{ data: any }>());
export const UpdateOrgsSearch = createAction('[Admin-Users] Update Orgs List Search', props<{ search: any }>());
export const AddOrg = createAction('[Admin-User-Orgs] Add Org', props<{ item: Models.Org; modal: any }>());
export const UpdateOrg = createAction('[Admin-User-Orgs] Update Org', props<{ item: Models.Org }>());
export const DeleteOrgs = createAction('[Admin-User-Orgs] Delete Orgs', props<{ ids: number[], grid: any }>());
export const GoToOrg = createAction('[Admin-User-Orgs] Goto Org', props<{ id: number, tab: string }>());
export const SelectOrgs = createAction('[Admin-User-Orgs] Select Orgs', props<{ Orgs: Models.IdValue[] }>());
