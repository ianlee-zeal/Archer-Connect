import { createAction, props } from '@ngrx/store';

import { Settlement } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

const featureName = '[Settlement Information]';

export const SettlementInfoError = createAction(`${featureName} API Error`, props<{ error: string }>());

export const GetSettlementInfo = createAction(`${featureName} Get Settlement`, props<{ id: number }>());
export const GetSettlementInfoComplete = createAction(`${featureName} Get Settlement Complete`, props<{ settlement: Settlement }>());

export const GetSettlementLoadingStarted = createAction(`${featureName} Get Settlement Loading Started`);

export const SaveUpdatedSettlement = createAction(`${featureName} Save Settlement`, props<{ settlement: Settlement, callback:() => void }>());
export const SaveUpdatedSettlementComplete = createAction(`${featureName} Save Settlement Complete`, props<{ updatedSettlement: Settlement }>());

export const DeleteSettlement = createAction(`${featureName} Delete Settlement`, props<{ settlementId: number, callback:() => void }>());
export const DeleteSettlementComplete = createAction(`${featureName} Delete Settlement Complete`);

export const UpdateSettlementInfo = createAction(`${featureName} Update Settlement`, props<{ settlement: Settlement, isSettlementValid: boolean }>());

export const UpdateSettlementInfoActionBar = createAction(`${featureName} Update Settlement Information Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GoToSettlements = createAction(`${featureName} Go To Settlements`);
