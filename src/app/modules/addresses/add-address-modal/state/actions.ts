import { createAction, props } from '@ngrx/store';

import { EntityAddress } from '../../../../models/entity-address';

const featureName = '[Add Address Modal]';

export const OpenAddressModal = createAction(`${featureName} Open Add Address Modal`, props<{ entityName: string, entityId: number, entityTypeId: number, address?: EntityAddress, canEdit?: boolean, canRunMoveCheck?: boolean, isPrimaryAddress?: boolean, showAddresseeAndAttnTo?: boolean }>());
export const CloseAddressModal = createAction(`${featureName} Close Modal`, props<{ close: Function }>());

export const ChangeAddress = createAction(`${featureName} Change Address`, props<{ address: EntityAddress, isAddressFormValid: boolean, isPristineAddressForm: boolean }>());
export const ChangeAddressFormValidators = createAction(`${featureName} Change Address Form Validators`, props<{ isAddressFormValid: boolean, isPristineAddressForm: boolean }>());
export const ResetAddress = createAction(`${featureName} Reset Address`);

export const DeleteAddressRequest = createAction(`${featureName} Delete Address Request`, props<{ close: Function }>());
export const DeleteAddressSuccess = createAction(`${featureName} Delete Address Success`, props<{ addressId: number }>());

export const SetAddress = createAction(`${featureName} Set Address Modal`, props<{ address: EntityAddress, canEdit: boolean, canRunMoveCheck: boolean }>());
