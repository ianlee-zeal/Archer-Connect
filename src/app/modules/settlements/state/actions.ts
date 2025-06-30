import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { Settlement } from '@app/models/settlement';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

import { Claimant } from '@app/models/claimant';
import { Project } from '@app/models';
import { SettlementFinancialSummary } from '@app/models/settlement/settlement-financial-summary';

export const FEATURE_NAME = '[Settlements]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ errorMessage: string }>());

export const GetSettlementsList = createAction(`${FEATURE_NAME} Get List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetSettlementsListComplete = createAction(`${FEATURE_NAME} Get List Complete`, props<{ settlements: Settlement[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetSettlementsListError = createAction(`${FEATURE_NAME} Get List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const CreateSettlement = createAction(`${FEATURE_NAME} Create New`, props<{ settlement: Settlement, modal: BsModalRef }>());
export const CreateSettlementComplete = createAction(`${FEATURE_NAME} Create New Complete`, props<{ settlementId: number, modal: BsModalRef }>());

export const ResetCreateSettlementState = createAction(`${FEATURE_NAME} Reset Create Settlement State`);

export const UpdateActionBar = createAction(`${FEATURE_NAME} Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const UpdatePreviousSettlementId = createAction(`${FEATURE_NAME} Update Previous Settlement Id`, props<{ prevSettlementId: number }>());
export const UpdatePreviousSettlementUrl = createAction(`${FEATURE_NAME} Update Selected Settlement Url`, props<{ settlementPreviousUrl: string }>());

export const DownloadDocument = createAction(`[${FEATURE_NAME}] Download Document`, props<{ id: number }>());
export const DownloadDocumentError = createAction(`${FEATURE_NAME} Download Document Error`, props<{ errorMessage: string }>());

export const GetClaimantList = createAction(`${FEATURE_NAME} Get Related Claimant List`, props<{ settlementId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetClaimantListSuccess = createAction(`${FEATURE_NAME} Get Related Claimant List Complete`, props<{ claimants: Claimant[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetClaimantListError = createAction(`${FEATURE_NAME} Get Related Claimant List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const GetProjectList = createAction(`${FEATURE_NAME} Get Related Project List`, props<{ settlementId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetProjectListSuccess = createAction(`${FEATURE_NAME} Get Related Project List Complete`, props<{ projects: Project[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetProjectListError = createAction(`${FEATURE_NAME} Get Related Project List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const GetFinancialSummary = createAction(`${FEATURE_NAME} Get Financial Summary`, props<{ settlementId: number }>());
export const GetFinancialSummarySuccess = createAction(`${FEATURE_NAME} Get Financial Summary Complete`, props<{ financialSummary: SettlementFinancialSummary }>());
export const GetFinancialSummaryError = createAction(`${FEATURE_NAME} Get Financial Summary Error`, props<{ errorMessage: string }>());
