import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, tap, withLatestFrom, filter, map } from 'rxjs/operators';
import { of } from 'rxjs';

import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import { Payment } from '@app/models/payment';
import * as fromAuth from '@app/modules/auth/state';
import { IdValue } from '@app/models/idValue';
import { AddressService, ModalService, OrgsService, PaymentsSearchService, ToastService } from '@app/services';
import { EntityTypeEnum, ExportName } from '@app/models/enums';

import { StopPaymentRequestService } from '@app/services/api/stop-payment-request.service';
import { StopPaymentRequest } from '@app/models/stop-payment-request';
import * as rootActions from '@app/state/root.actions';
import { AddressVerificationConfiguration, AddressVerificationRequest } from '@app/models/address';
import * as addressVerificationActions from '@app/modules/addresses/add-address-modal/address-verification-modal/state/actions';
import { EntityAddress, PaymentItemDetail, TransferItemDetail } from '@app/models';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { CheckVerificationService } from '@app/services/api/check-verification.service';
import { CheckVerificationGrid } from '@app/models/check-verification/check-verification-grid';
import { CheckVerification } from '@app/models/check-verification/check-verification';
import { BatchActionsService } from '@app/services/api/batch-actions.service';
import * as actions from './actions';
import * as paymentsIndex from './index';
import { StopPaymentModalComponent } from '../stop-payment-request-modal/stop-payment-modal.component';
import { CheckVerificationModalComponent } from '../check-verification-modal/check-verification-modal.component';
import { TransfersService } from '@app/services/api/transfers.service';

@Injectable()
export class PaymentsEffects {
  constructor(
    private actions$: Actions,
    private orgsService: OrgsService,
    private store: Store<paymentsIndex.AppState>,
    private paymentsSearchService: PaymentsSearchService,
    private transfersService: TransfersService,
    private stopPaymentRequestService: StopPaymentRequestService,
    private checkVerificationService: CheckVerificationService,
    private toaster: ToastService,
    private router: Router,
    private addressService: AddressService,
    private toastService: ToastService,
    private readonly modalService: ModalService,
    private batchActionsService: BatchActionsService,
  ) {}

  getPayments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPayments),
    mergeMap(action => this.paymentsSearchService.searchEntityPayments(action.params.request, action.entityId, action.entityTypeId)
      .pipe(
        switchMap(response => {
          const items = response.items.map(Payment.toModel);
          return [
            actions.GetPaymentsComplete({ items, params: action.params, totalRecords: response.totalRecordsCount }),
          ];
        }),
        catchError(error => of(actions.Error(error))),
      )),
  ));

  getPaymentsComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentsComplete),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getPaymentItemDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentItemDetails),
    mergeMap(action => this.paymentsSearchService.getPaymentItemDetails(action.params.request, action.paymentId)
      .pipe(
        switchMap(response => {
          const items = response.items.map(PaymentItemDetail.toModel);
          return [
            actions.GetPaymentItemDetailsComplete({ items, params: action.params, totalRecords: response.totalRecordsCount }),
          ];
        }),
        catchError(error => of(actions.Error(error))),
      )),
  ));

  getPaymentItemDetailsComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentItemDetailsComplete),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getTransferItemDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTransferItemDetails),
    mergeMap(action => this.transfersService.getTransferItemDetails(action.params.request, action.transferId)
      .pipe(
        switchMap(response => {
          const items = response.items.map(TransferItemDetail.toModel);
          return [
            actions.GetTransferItemDetailsComplete({ items, params: action.params, totalRecords: response.totalRecordsCount }),
          ];
        }),
        catchError(error => of(actions.Error(error))),
      )),
  ));

  getTransferItemDetailsComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTransferItemDetailsComplete),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getSubOrganizations$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSubOrganizations),
    withLatestFrom(this.store.select(fromAuth.authSelectors.selectedOrganization)),
    filter(([, org]) => !!org),
    mergeMap(([, currentOrg]) => this.orgsService.getSubOrgDropdownValues(currentOrg.id).pipe(
      switchMap(response => [
        actions.GetSubOrganizationsComplete({ subOrganizations: response as IdValue[] }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getOrgBankAccounts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetOrgBankAccounts),
    mergeMap(action => this.orgsService.getBankAccountDropdownValues(action.orgId).pipe(
      switchMap(response => [
        actions.GetOrgBankAccountsComplete({ bankAccounts: response as IdValue[] }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getUserOrgBankAccounts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetUserOrgBankAccounts),
    mergeMap(() => this.orgsService.getUserOrgBankAccounts().pipe(
      switchMap(response => [
        actions.GetOrgBankAccountsComplete({ bankAccounts: response as IdValue[] }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getPaymentDetailsLoadingStarted$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentDetailsLoadingStarted),
    map(action => rootActions.LoadingStarted({
      actionNames: [
        actions.GetPaymentDetails.type].concat(action.additionalActionNames || [] as any),
    })),
  ));

  getPaymentDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPaymentDetails),
    mergeMap(action => this.paymentsSearchService.get(action.paymentId).pipe(
      switchMap(response => [
        actions.GetPaymentDetailsComplete({ payment: Payment.toModel(response) }),
        rootActions.LoadingFinished({ actionName: actions.GetPaymentDetails.type })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  goToPaymentsDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToPaymentsDetails),
    tap(({ payload }) => {
      let path: any[];
      switch (payload.entityType) {
        case EntityTypeEnum.Clients:
          path = ['/', 'claimants', payload.entityId, 'payments', 'tabs', 'history', payload.id];
          break;
        case EntityTypeEnum.Projects:
          path = ['/', 'projects', payload.entityId, 'payments', 'tabs', 'history', payload.id];
          break;
        default:
          path = ['/', 'admin', 'payments', payload.id];
          break;
      }
      this.router.navigate(path);
    }),
  ), { dispatch: false });

  goToTransfersDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToTransfersDetails),
    tap(({ payload }) => {
      let path: any[];
      switch (payload.entityType) {
        case EntityTypeEnum.Clients:
          path = ['/', 'claimants', payload.entityId, 'payments', 'tabs', 'history', payload.id];
          break;
        case EntityTypeEnum.Projects:
          path = ['/', 'projects', payload.entityId, 'payments', 'tabs', 'history', payload.id];
          break;
        default:
          path = ['/', 'admin', 'transfers', payload.id];
          break;
      }
      this.router.navigate(path);
    }),
  ), { dispatch: false });

  goToPaymentsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToPaymentsList),
    tap(({ payload }) => {
      let path: any[];
      switch (payload.entityType) {
        case EntityTypeEnum.Clients:
          path = ['/', 'claimants', payload.entityId, 'payments', 'tabs', 'history'];
          break;
        case EntityTypeEnum.Projects:
          path = ['/', 'projects', payload.entityId, 'payments', 'tabs', 'history'];
          break;
        default:
          path = ['/', 'admin', 'payments'];
          break;
      }
      this.router.navigate(path);
    }),
  ), { dispatch: false });

  goToStopPaymentRequestList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToStopPaymentRequestList),
    tap(() => {
      const path = ['/', 'disbursements', 'tabs', 'stop-payment-requests'];
      this.router.navigate(path);
    }),
  ), { dispatch: false });

  goToTransfersList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToTransfersList),
    tap(({ payload }) => {
      let path: any[];
      switch (payload.entityType) {
        case EntityTypeEnum.Clients:
          path = ['/', 'claimants', payload.entityId, 'payments', 'tabs', 'history'];
          break;
        case EntityTypeEnum.Projects:
          path = ['/', 'projects', payload.entityId, 'payments', 'tabs', 'history'];
          break;
        default:
          path = ['/', 'admin', 'transfers'];
          break;
      }
      this.router.navigate(path);
    }),
  ), { dispatch: false });

  downloadPayments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.StartDownloadPaymentsJob),
    mergeMap(action => this.paymentsSearchService.export(
      ExportName[ExportName.Payments],
      action.agGridParams.request,
      action.columns,
      action.entityId,
      action.entityTypeId,
      action.channelName,
    ).pipe(
      switchMap(data => [actions.StartDownloadPaymentsJobComplete({ channel: data })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  downloadDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadPaymentsDocument),
    mergeMap(action => this.paymentsSearchService.downloadDocument(action.id).pipe(
      switchMap(() => []),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getStopPaymentRequestDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetStopPaymentDetails),
    mergeMap(action => this.stopPaymentRequestService.get(action.id).pipe(
      switchMap(response => [actions.GetStopPaymentDetailsComplete({ stopPaymentRequest: StopPaymentRequest.toModel(response) })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getStopPaymentRequestDropDownValues$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetStopPaymentDropdownValues),
    mergeMap(() => this.stopPaymentRequestService.getDropdownValues().pipe(
      switchMap(response => [actions.GetStopPaymentDropdownValuesComplete(response)]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  submitStopPaymentRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SubmitStopPaymentRequest),
    mergeMap(
      ({ stopPaymentRequest }) => (stopPaymentRequest.id ? this.stopPaymentRequestService.put(stopPaymentRequest) : this.stopPaymentRequestService.post(stopPaymentRequest))
        .pipe(
          switchMap(() => ([
            actions.SubmitStopPaymentRequestComplete({ id: stopPaymentRequest.id }),

          ])),
          catchError(error => of(actions.Error({ error }))),
        ),
    ),
  ));

  submitStopPaymentRequestComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SubmitStopPaymentRequestComplete),
    tap(action => this.toaster.showSuccess(`Stop Payment Request was ${action.id > 0 ? 'updated' : 'created'}`)),
  ), { dispatch: false });

  verifyRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.VerifyRequest),
    mergeMap(action => this.addressService.validateAddress(AddressVerificationRequest.toDto(action.address, { includeName: false, advancedAddressCorrection: true } as AddressVerificationConfiguration)).pipe(
      switchMap(result => [
        actions.VerifySuccess({
          close: action.close,
          address: action.address,
          verifiedAddress: result,
          entityName: action.entityName,
          webAppLocation: action.webAppLocation,
        }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  verifySuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.VerifySuccess),
    switchMap(action => [
      addressVerificationActions.OpenModal({ close: action.close, entityName: action.entityName, webAppLocation: action.webAppLocation }),
      addressVerificationActions.VerifyAddressSuccess({ verifiedAddress: action.verifiedAddress }),
    ]),
  ));

  saveAddressRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveAddressRequest),
    switchMap(action => [
      addressVerificationActions.CloseModal({ close: action.close }),
      actions.SaveAddressSuccess({ address: EntityAddress.toModel(action.address), message: action.message }),
    ]),
  ));

  saveAddressSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveAddressSuccess),
    tap(action => {
      this.toastService.showSuccess(action.message);
    }),
  ), { dispatch: false });

  downloadAttachments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadAttachments),
    mergeMap(action => this.stopPaymentRequestService
      .downloadAttachments(action.id, action.entityType)
      .pipe(catchError(error => of(actions.Error({ error }))))),
  ), { dispatch: false });

  enqueueBatchStopPaymentUpdateStatus$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueBatchStopPaymentUpdateStatus),
    mergeMap(action => this.stopPaymentRequestService.updateStatusBatchAction(action.batchActionForm)
      .pipe(
        switchMap(batchActionData => this.batchActionsService.process(batchActionData.id).pipe(
          switchMap(res => [actions.EnqueueBatchStopPaymentUpdateStatusSuccess({ batchAction: BatchAction.toModel(res) })]),
          catchError(error => of(actions.Error({ error }))),
        )),
      )),
  ));

  openStopPaymentRequestModal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.OpenStopPaymentRequestModal),
    tap(action => {
      const initialState = {
        paymentId: action.paymentId,
        canEdit: action.canEdit,
        loadPayment: action.loadPayment,
      };

      this.modalService.show(StopPaymentModalComponent, {
        initialState,
        class: 'wide-modal',
      });
    }),
  ), { dispatch: false });

  openCheckVerificationModal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.OpenCheckVerificationModal),
    tap(action => {
      const initialState = {
        paymentId: action.paymentId,
        canEdit: action.canEdit,
      };

      this.modalService.show(CheckVerificationModalComponent, { initialState });
    }),
  ), { dispatch: false });

  editCheckVerificationModal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EditCheckVerificationModal),
    tap(action => {
      const initialState = {
        checkVerificationId: action.checkVerificationId,
        editMode: action.editMode,
      };

      this.modalService.show(CheckVerificationModalComponent, { initialState });
    }),
  ), { dispatch: false });

  getCheckVerificationDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetCheckVerificationDetails),
    mergeMap(action => this.checkVerificationService.get(action.id).pipe(
      switchMap(response => [actions.GetCheckVerificationDetailsComplete({ checkVerification: CheckVerification.toModel(response) })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  submitCheckVerification$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SubmitCheckVerification),
    mergeMap(
      ({ checkVerification }) => (checkVerification.id ? this.checkVerificationService.put(checkVerification) : this.checkVerificationService.post(checkVerification))
        .pipe(
          switchMap(() => ([
            actions.SubmitCheckVerificationComplete(),
          ])),
          catchError(error => of(actions.Error({ error }))),
        ),
    ),
  ));

  getCheckVerificationList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetCheckVerificationList),
    mergeMap(action => this.checkVerificationService.search(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetCheckVerificationListComplete({
            checkVerificationList: response.items.map(CheckVerificationGrid.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getCheckVerificationListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetCheckVerificationListComplete),
    tap(action => {
      action.agGridParams?.success({ rowData: action.checkVerificationList, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  downloadCheckVerificationAttachments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadCheckVerificationAttachments),
    mergeMap(action => this.checkVerificationService
      .downloadAttachments(action.id)
      .pipe(catchError(error => of(actions.Error({ error }))))),
  ), { dispatch: false });

  voidPaymentRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.VoidPaymentRequest),
    mergeMap(action => this.paymentsSearchService
      .voidPayment(action.id, action.note)
      .pipe(
        switchMap(() => [actions.VoidPaymentRequestSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  voidTransferPaymentRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.VoidTransferPaymentRequest),
    mergeMap(action => this.transfersService
      .voidPayment(action.id, action.note)
      .pipe(
        switchMap(() => [actions.VoidPaymentRequestSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getCanTransferBeVoided$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetCanTransferBeVoided),
    mergeMap(action => this.transfersService
      .getCanBeVoided(action.id)
      .pipe(
        switchMap(response => [actions.GetCanTransferBeVoidedSuccess(response)]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(
      actions.Error,
    ),
    map(({ error }) => [this.toaster.showError(error)]),
  ), { dispatch: false });
}
