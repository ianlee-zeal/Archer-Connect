import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { Payment } from '@app/models/payment';
import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/actions';
import { ColumnExport } from '@app/models/column-export';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { IdValue } from '@app/models/idValue';
import { EntityTypeEnum } from '@app/models/enums';
import { StopPaymentRequest } from '@app/models/stop-payment-request';
import { EntityAddress, PaymentItemDetail, TransferItemDetail } from '@app/models';
import { VerifiedAddress } from '@app/models/address';
import { WebAppLocation } from '@app/models/enums/web-app-location.enum';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { CheckVerificationGrid } from '@app/models/check-verification/check-verification-grid';
import { CheckVerification } from '@app/models/check-verification/check-verification';
import { IPagerPayload } from '@app/modules/shared/state/common.actions';

/**
 * Describes payload data for working with the payments related to some entity (claimant, project, etc)
 *
 * @export
 * @interface IEntityPaymentsPayload
 */
export interface IEntityPaymentsPayload extends IPagerPayload {

  /**
   * Payment id
   *
   * @type {number}
   * @memberof IEntityPaymentsPayload
   */
  id?: number;

  /**
   * Parent entity id (claimant id, project id, etc)
   *
   * @type {number}
   * @memberof IEntityPaymentsPayload
   */
  entityId: number;

  /**
   * Parent entity type
   *
   * @type {EntityTypeEnum}
   * @memberof IEntityPaymentsPayload
   */
  entityType: EntityTypeEnum;

  /**
   * Grid params
   *
   * @type {IServerSideGetRowsParamsExtended}
   * @memberof IEntityPaymentsPayload
   */
  agGridParams?: IServerSideGetRowsParamsExtended;
}

export const FEATURE_NAME = '[Payments]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ error: any }>());

export const UpdatePaymentsSearchListActionBar = createAction(`${FEATURE_NAME} Update Payments Search List Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GetPayments = createAction(`${FEATURE_NAME} Get Payments`, props<{ entityId: number, entityTypeId: EntityTypeEnum, params: IServerSideGetRowsParamsExtended }>());
export const GetPaymentsComplete = createAction(`${FEATURE_NAME} Get Payments Complete`, props<{ items: Payment[], params: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const GetPaymentItemDetails = createAction(`${FEATURE_NAME} Get Payment Item Details`, props<{ paymentId: number, params: IServerSideGetRowsParamsExtended }>());
export const GetPaymentItemDetailsComplete = createAction(`${FEATURE_NAME} Get Payment Item Details Complete`, props<{ items: PaymentItemDetail[], params: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const GetPaymentDetailsLoadingStarted = createAction(`${FEATURE_NAME} Get Payment Details Loading Started`, props<{ additionalActionNames: string[] }>());

export const GetPaymentDetails = createAction(`${FEATURE_NAME} Get Payment Details`, props<{ paymentId: number }>());
export const GetPaymentDetailsComplete = createAction(`${FEATURE_NAME} Get Payment Details Complete`, props<{ payment: Payment }>());

export const StartDownloadPaymentsJob = createAction(`${FEATURE_NAME} Start Download Payments Job`, props<{
  agGridParams: IServerSideGetRowsParamsExtended,
  columns: ColumnExport[],
  entityTypeId: EntityTypeEnum,
  entityId: number,
  channelName: string,
}>());
export const StartDownloadPaymentsJobComplete = createAction(`${FEATURE_NAME} Start Download Payments Job Complete`, props<{ channel: string }>());
export const DownloadPaymentsDocument = createAction(`[${FEATURE_NAME}] Download Payments Document`, props<{ id: number }>());

export const GetSubOrganizations = createAction(`${FEATURE_NAME} Get Sub Organizations of Selected Organization`);
export const GetSubOrganizationsComplete = createAction(`${FEATURE_NAME} Get Sub Organizations of Selected Organization Complete`, props<{ subOrganizations: IdValue[] }>());

export const GetOrgBankAccounts = createAction(`${FEATURE_NAME} Get Org Bank Accounts`, props<{ orgId: number }>());
export const GetUserOrgBankAccounts = createAction(`${FEATURE_NAME} Get User Org Bank Accounts`);
export const GetOrgBankAccountsComplete = createAction(`${FEATURE_NAME} Get Org Bank Accounts Complete`, props<{ bankAccounts: IdValue[] }>());
export const ClearOrgBankAccounts = createAction(`${FEATURE_NAME} Clear Org Bank Accounts`);

export const GoToPaymentsList = createAction(`${FEATURE_NAME} Go To Payments List`, props<{ payload: IEntityPaymentsPayload }>());
export const GoToPaymentsDetails = createAction(`${FEATURE_NAME} Go To Payments Details`, props<{ payload: IEntityPaymentsPayload }>());
export const GoToStopPaymentRequestList = createAction(`${FEATURE_NAME} Go To Stop Payment Request List`);

export const GoToTransfersList = createAction(`${FEATURE_NAME} Go To Transfers List`, props<{ payload: IEntityPaymentsPayload }>());
export const GoToTransfersDetails = createAction(`${FEATURE_NAME} Go To Transfers Details`, props<{ payload: IEntityPaymentsPayload }>());

export const GetTransferItemDetails = createAction(`${FEATURE_NAME} Get Transfer Item Details`, props<{ transferId: number, params: IServerSideGetRowsParamsExtended }>());
export const GetTransferItemDetailsComplete = createAction(`${FEATURE_NAME} Get Transfer Item Details Complete`, props<{ items: TransferItemDetail[], params: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const SaveSearchParams = fromAdvancedSearch.SaveSearchParamsFor(FEATURE_NAME);
export const SaveAdvancedSearchVisibility = fromAdvancedSearch.SaveAdvancedSearchVisibilityFor(FEATURE_NAME);

export const GetStopPaymentDetails = createAction(`${FEATURE_NAME} Get Stop Payment Details`, props<{ id: number }>());
export const GetStopPaymentDetailsComplete = createAction(`${FEATURE_NAME} Get Stop Payment Details Complete`, props<{ stopPaymentRequest: StopPaymentRequest }>());

export const GetStopPaymentDropdownValues = createAction(`${FEATURE_NAME} Get Stop Payment Request Drodown Values`);
export const GetStopPaymentDropdownValuesComplete = createAction(`${FEATURE_NAME} Get Stop Payment Request Drodown Values Complete`, props<{ addressTypes: IdValue[], statuses: IdValue[], resendReasons: IdValue[], resendReasonSpecifications: IdValue[] }>());

export const SubmitStopPaymentRequest = createAction(`${FEATURE_NAME} Submit Stop Payment Request`, props<{ stopPaymentRequest: any }>());
export const SubmitStopPaymentRequestComplete = createAction(`${FEATURE_NAME} Submit Stop Payment Request Complete`, props<{ id: number }>());
export const CancelSubmitStopPayment = createAction(`${FEATURE_NAME} Cancel Submit Stop Payment`);

export const SubmitCheckVerification = createAction(`${FEATURE_NAME} Submit Check Verification`, props<{ checkVerification: any }>());
export const SubmitCheckVerificationComplete = createAction(`${FEATURE_NAME} Submit Check Verification Complete`);
export const ResetCheckVerification = createAction(`${FEATURE_NAME} Reset Check Verification`);

export const VerifyRequest = createAction(`${FEATURE_NAME} Verify Request`, props<{ address: EntityAddress, close: Function, entityName: string, webAppLocation: WebAppLocation }>());
export const VerifySuccess = createAction(`${FEATURE_NAME} Verify Success`, props<{ close: Function, address: EntityAddress, verifiedAddress: VerifiedAddress, entityName: string, webAppLocation: WebAppLocation }>());

export const SaveAddressRequest = createAction(`${FEATURE_NAME} Save Address Request`, props<{ address: EntityAddress, close: Function, message: string }>());
export const SaveAddressSuccess = createAction(`${FEATURE_NAME} Save Address Success`, props<{ address: EntityAddress, message: string }>());

export const DownloadAttachments = createAction(`${FEATURE_NAME} SPR Download Attachments`, props<{ id: number, entityType: number }>());

export const DownloadAttachment = createAction(`${FEATURE_NAME} SPR Download Attachment`, props<{ attachmentId: number }>());

export const EnqueueBatchStopPaymentUpdateStatus = createAction(`${FEATURE_NAME} Enqueue Batch Stop Payment Update Status`, props<{ batchActionForm: FormData }>());
export const EnqueueBatchStopPaymentUpdateStatusSuccess = createAction(`${FEATURE_NAME} Enqueue Batch Stop Payment Update Status Success`, props<{ batchAction: BatchAction }>());
export const BatchUpdateStopPaymentStatusError = createAction(`${FEATURE_NAME} Batch Update Stop Payment Status Error`);

export const OpenStopPaymentRequestModal = createAction(`${FEATURE_NAME} Open Stop Payment Request Modal`, props<{ paymentId: number, canEdit: boolean, loadPayment: boolean }>());
export const OpenCheckVerificationModal = createAction(`${FEATURE_NAME} Open Check Verification Modal`, props<{ paymentId: number, canEdit: boolean }>());
export const EditCheckVerificationModal = createAction(`${FEATURE_NAME} Edit Check Verification Modal`, props<{ checkVerificationId: number, editMode: boolean }>());

export const GetCheckVerificationDetails = createAction(`${FEATURE_NAME} Get Check Verification Details`, props<{ id: number }>());
export const GetCheckVerificationDetailsComplete = createAction(`${FEATURE_NAME} Get Check Verification Details Complete`, props<{ checkVerification: CheckVerification }>());
export const GetCheckVerificationList = createAction(`${FEATURE_NAME} Search Check Verification List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetCheckVerificationListComplete = createAction(`${FEATURE_NAME} Search Check Verification List Complete`, props<{ checkVerificationList: CheckVerificationGrid[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const DownloadCheckVerificationAttachments = createAction(`${FEATURE_NAME} Check Verification Download Attachments`, props<{ id: number }>());

export const ResetStopPaymentRequest = createAction(`${FEATURE_NAME} Reset  Stop Payment Request`);
export const ResetPaymentDetails = createAction(`${FEATURE_NAME} Reset Payment Details`);

export const VoidPaymentRequest = createAction(`${FEATURE_NAME} Void Payment Request`, props<{ id: number, note: string }>());
export const VoidPaymentRequestSuccess = createAction(`${FEATURE_NAME} Void Payment Request Success`);
export const VoidTransferPaymentRequest = createAction(`${FEATURE_NAME} Void Transfer Payment Request`, props<{ id: number, note: string }>());

export const GetCanTransferBeVoided = createAction(`${FEATURE_NAME} Can Transfer Payment Be Voided Request`, props<{ id: number }>());
export const GetCanTransferBeVoidedSuccess = createAction(`${FEATURE_NAME} Get Can Transfer Payment Be Voided Success`, props<{ isVoidable: boolean, message: string | null }>());
