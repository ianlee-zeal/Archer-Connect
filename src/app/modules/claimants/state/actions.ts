import { createAction, props } from '@ngrx/store';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { NavigationSettings } from '@app/modules/shared/action-bar/navigation-settings';
import { IdValue } from '@app/models';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

const featureName = '[Claimants]';

export const Error = createAction(`${featureName} Error`, props<{ errorMessage: string }>());

export const GoToClaimantDetails = createAction(`${featureName} Go To Claimant Details`, props<{ id: number, navSettings: NavigationSettings }>());
export const GoToClaimantsListPage = createAction(`${featureName} Go To Claimants List Page`);
export const UpdateClaimantsActionBar = createAction(`${featureName} Update Claimants Action Bar`, props<{ actionBar: ActionHandlersMap }>());
export const UpdateClaimantListDataSource = createAction(`${featureName} Update Claimant List Data Source`, props<{ gridParamsRequest: IServerSideGetRowsRequestExtended }>());

export const GetAllMissingDocs = createAction(`${featureName} Get All Missing Docs`);
export const GetAllMissingDocsSuccess = createAction(`${featureName} Get All Missing Docs Success`, props<{ missingDocsOptions: IdValue[] }>());
export const GetAllDocsToSend = createAction(`${featureName} Get All Docs To Send`);
export const GetAllDocsToSendSuccess = createAction(`${featureName} Get All Docs To Send Success`, props<{ docsToSendOptions: IdValue[] }>());
export const GetDocumentsByProbateId = createAction(`${featureName} Get Documents By Probate Id`, props<{ probateId: number }>());
export const GetDocumentsByProbateIdSuccess = createAction(`${featureName} Get Documents By Probate Id Success`, props<{ allDocuments: IdValue[] }>());
