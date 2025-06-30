import { createReducer, on, Action } from '@ngrx/store';
import { IdValue } from '@app/models';
import { TimeZone } from '@app/models/time-zone';
import { LedgerAccount } from '@app/models/ledger-account';
import { LedgerAccountGroup } from '@app/models/ledger-account-group';
import { Stage } from '@app/models/stage';
import * as userProfileActions from './actions';
import { SelectOption } from '../../_abstractions/base-select';

export interface DropDownsValuesState {
  timeZones: TimeZone[];
  defaultGlobalSearchTypes: IdValue[];
  ledgerAccounts: LedgerAccount[],
  ledgerAccountGroups: LedgerAccountGroup[],
  stages: Stage[],
  statuses: IdValue[],
  lienTypes: IdValue[],
  planTypes: IdValue[],
  coaGroupNumbers: SelectOption[],
  coaNumbers: SelectOption[],
}

export const dropDownsValuesState: DropDownsValuesState = {
  timeZones: null,
  defaultGlobalSearchTypes: null,
  ledgerAccounts: null,
  ledgerAccountGroups: null,
  stages: null,
  statuses: null,
  lienTypes: null,
  planTypes: null,
  coaGroupNumbers: null,
  coaNumbers: null,
};

export const reducer = createReducer(
  dropDownsValuesState,

  on(userProfileActions.GetTimeZoneListRequestCompleted, (state, { timeZones }) => ({ ...state, timeZones })),
  on(userProfileActions.GetDefaultGlobalSearchTypeListRequestCompleted, (state, { defaultGlobalSearchTypes }) => ({ ...state, defaultGlobalSearchTypes })),
  on(userProfileActions.GetLedgerAccountsComplete, (state, { ledgerAccounts }) => ({ ...state, ledgerAccounts })),
  on(userProfileActions.GetLedgerAccountGroupsComplete, (state, { ledgerAccountGroups }) => ({ ...state, ledgerAccountGroups })),
  on(userProfileActions.GetStagesComplete, (state, { stages }) => ({ ...state, stages })),
  on(userProfileActions.GetStatusesComplete, (state, { statuses }) => ({ ...state, statuses })),
  on(userProfileActions.GetLienTypesComplete, (state, { lienTypes }) => ({ ...state, lienTypes })),
  on(userProfileActions.GetPlanTypesComplete, (state, { planTypes }) => ({ ...state, planTypes })),
  on(userProfileActions.GetChartOfAccountGroupNumbersComplete, (state, { coaGroupNumbers }) => ({ ...state, coaGroupNumbers })),
  on(userProfileActions.GetChartOfAccountNumbersComplete, (state, { coaNumbers }) => ({ ...state, coaNumbers })),
);

export function Reducer(state: DropDownsValuesState | undefined, action: Action) {
  return reducer(state, action);
}
