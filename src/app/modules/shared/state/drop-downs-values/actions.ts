import { createAction, props } from '@ngrx/store';
import { IdValue } from '@app/models';
import { TimeZone } from '@app/models/time-zone';
import { LedgerAccount } from '@app/models/ledger-account';
import { LedgerAccountGroup } from '@app/models/ledger-account-group';
import { Stage } from '@app/models/stage';
import { dropdownValues } from '@app/state';
import { SelectOption } from '../../_abstractions/base-select';

const DropDownsValues: string = '[DropDownValues]';

export const Error = createAction(`${DropDownsValues} API Error`, props<{ error: string }>());

export const GetDefaultGlobalSearchTypeListRequest = createAction(`${DropDownsValues} Get Default Global Search Types List Request`);
export const GetDefaultGlobalSearchTypeListRequestCompleted = createAction(`${DropDownsValues} Get Default Global Search Types List Request Completed`, props<{ defaultGlobalSearchTypes: IdValue[] }>());

export const GetTimeZoneListRequest = createAction(`${DropDownsValues} Get Time Zones List Request`);
export const GetTimeZoneListRequestCompleted = createAction(`${DropDownsValues} Get Time Zones List Request Completed`, props<{ timeZones: TimeZone[] }>());

export const GetLedgerAccounts = createAction(`${DropDownsValues} Get Ledger Accounts`, props<{ projectId?: number }>());
export const GetLedgerAccountsComplete = createAction(`${DropDownsValues} Get Ledger Accounts Complete`, props<{ ledgerAccounts: LedgerAccount[] }>());

export const GetLedgerAccountGroups = createAction(`${DropDownsValues} Get Ledger Account Groups`, props<{ projectId?: number }>());
export const GetLedgerAccountGroupsComplete = createAction(`${DropDownsValues} Get Ledger Account Groups Complete`, props<{ ledgerAccountGroups: LedgerAccountGroup[] }>());

export const GetStages = createAction(`${dropdownValues} Get Stages`, props<{ entityTypeId: number }>());
export const GetStagesComplete = createAction(`${DropDownsValues} Get Stages Complete`, props<{ stages: Stage[] }>());

export const GetStatuses = createAction(`${dropdownValues} Get Statuses`, props<{ entityTypeId: number }>());
export const GetStatusesComplete = createAction(`${DropDownsValues} Get Statuses Complete`, props<{ statuses: IdValue[] }>());

export const GetLienTypes = createAction(`${dropdownValues} Get Lien Types`);
export const GetLienTypesComplete = createAction(`${dropdownValues} Get Lien Types Complete`, props<{ lienTypes: IdValue[] }>());

export const GetPlanTypes = createAction(`${dropdownValues} Get Plan Types`);
export const GetPlanTypesComplete = createAction(`${dropdownValues} Get Plan ypes Complete`, props<{ planTypes: IdValue[] }>());

export const GetChartOfAccountGroupNumbers = createAction(`${dropdownValues} Get Chart Of Account Group Numbers`);
export const GetChartOfAccountGroupNumbersComplete = createAction(`${dropdownValues} Get Chart Of Account Group Numbers Complete`, props<{ coaGroupNumbers : SelectOption[] }>());

export const GetChartOfAccountNumbers = createAction(`${dropdownValues} Get Chart Of Account Numbers`);
export const GetChartOfAccountNumbersComplete = createAction(`${dropdownValues} Get Chart Of Account Numbers Complete`, props<{ coaNumbers: SelectOption[] }>());
