import { createAction, props } from '@ngrx/store';

import { AddressMoveCheckConfiguration, AddressMoveCheckResult, VerifiedAddress, AddressVerificationConfiguration } from '@app/models/address';
import { EntityAddress } from '@app/models';
import { WebAppLocation } from '@app/models/enums/web-app-location.enum';

const featureName = '[Address Verification Modal]';

export const OpenModal = createAction(`${featureName} Open Address Verification Modal`, props<{ close: Function, entityName: string, webAppLocation?: WebAppLocation, returnAddressOnSave?: boolean }>());
export const CloseModal = createAction(`${featureName} Close Modal`, props<{ close: Function }>());
export const ModalError = createAction(`${featureName} API Error`, props<{ errorMessage: string }>());
export const ClearError = createAction(`${featureName} Clear Error`);

export const LoadDefaultData = createAction(`${featureName} Load Dropdown Data`);
export const LoadDefaultDataComplete = createAction(`${featureName} Load Dropdown Data Complete`, props<{ data: any[] }>());

export const UpdateMoveCheckResult = createAction(`${featureName} Update Move Check Result`, props<{ moveCheckResults: AddressMoveCheckResult[] }>());

export const ChangeVerificationConfiguration = createAction(`${featureName} Change Verification Configuration`, props<{ verifyConfiguration: AddressVerificationConfiguration }>());

export const VerifyAddressRequest = createAction(`${featureName} Verify Address Request`);
export const VerifyAddressSuccess = createAction(`${featureName} Verify Address Success`, props<{ verifiedAddress: VerifiedAddress }>());

export const UseVerifiedAddress = createAction(`${featureName} Use Verified Address`, props<{ useVerifiedAddress: boolean }>());

export const ChangeMoveCheckConfiguration = createAction(`${featureName} Change Move Check Configuration`, props<{ moveCheckConfiguration: AddressMoveCheckConfiguration }>());
export const AddressModalMoveCheckAddressRequest = createAction(`${featureName} Address Modal Move Check Address Request`, props<{ close: Function, entityName: string }>());

export const MoveCheckAddressRequest = createAction(`${featureName} Move Check Address Request`);
export const MoveCheckAddressSuccess = createAction(`${featureName} Move Check Success`, props<{ moveCheckResults: AddressMoveCheckResult[] }>());

export const SaveMoveCheckAddressRequest = createAction(`${featureName} Save Move Check Address Request`, props<{ address: AddressMoveCheckResult }>());
export const SaveMoveCheckAddressSuccess = createAction(`${featureName} Save Move Check Address Success`);

// export const ShowVerificationComponents = createAction(`${featureName} Show Verification Components`, props<{ verify: boolean, moveCheck: boolean }>());

export const VerifyRequest = createAction(`${featureName} Verify And Save`, props<{ close: Function, entityName: string }>());
export const VerifySuccess = createAction(`${featureName} Verify Or Save`, props<{ close: Function, address: EntityAddress, verifiedAddress: VerifiedAddress, entityName: string }>());

export const SaveAddressRequest = createAction(`${featureName} Save Address Request`, props<{ address: EntityAddress, close: Function, message: string }>());
export const SaveAddressSuccess = createAction(`${featureName} Save Address Success`, props<{ message: string }>());

export const UpdateAddressRequest = createAction(`${featureName} Update Address Request`, props<{ address: EntityAddress, close: Function, message: string }>());
export const UpdateAddressSuccess = createAction(`${featureName} Update Address Success`, props<{ message: string }>());
