import { createAction, props } from '@ngrx/store';

import { EntityAddress } from '@app/models/entity-address';
import { EntityTypeEnum } from '@app/models/enums';
import { EntityPair } from '@app/modules/shared/_interfaces';
import { ActionHandlersMap } from '../../../shared/action-bar/action-handlers-map';

export interface AddressesListSearchParams {
  entityType: EntityTypeEnum;
  entityId: number;
}

export interface AddressesListResponse {
  addresses: EntityAddress[],
  entityPair: EntityPair,
}

const featureName = '[Addresses List]';

export const Error = createAction(`${featureName} Addresses API Error`, props<{ errorMessage: string }>());
export const UpdateAddressesListActionBar = createAction(`${featureName} Update Addresses List Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GetAddressesList = createAction(`${featureName} Get Addresses List`, props<{ searchParams: AddressesListSearchParams }>());
export const GetAddressesListComplete = createAction(`${featureName} Get Addresses List Complete`, props<{ addresses: EntityAddress[] }>());
export const GetAddressesListError = createAction(`${featureName} Get Addresses List Error`, props<{ errorMessage: string }>());

export const RefreshAddressesList = createAction(`${featureName} Refresh Addresses List`);
export const RefreshAddressesListComplete = createAction(`${featureName} Refresh Address List Complete`);

export const GetAddressDetailsComplete = createAction(`${featureName} Get Address Details Complete`, props<{ address: EntityAddress }>());

export const UpdateAddressDetails = createAction(`${featureName} Update Address Details`, props<{ addressId: number, address: EntityAddress }>());
export const UpdateAddressComplete = createAction(`${featureName} Update Address Complete`);

export const SetPrimaryAddress = createAction(`${featureName} Set Primary Address`, props<{ addressId: number }>());

export const ChangeSelectedItems = createAction(`${featureName} Change Selected Items`, props<{ selected: EntityAddress[] }>());
