import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, tap, withLatestFrom, map, filter } from 'rxjs/operators';
import { of } from 'rxjs';

import * as services from '@app/services';
import { BankAccount } from '@app/models/bank-account';
import { PaymentPreferencesItem } from '@app/models';
import * as userAccessPolicieAactions from '@app/modules/admin/user-access-policies/orgs/state/actions';
import { OrganizationPaymentInstructionService } from '@app/services/api/org/org-payment-instruction.service';
import * as actions from './actions';
import * as selectors from './selectors';
import * as bankAccountsIndex from './index';

@Injectable()
export class BankAccountEffects {
  constructor(
    private actions$: Actions,
    private store: Store<bankAccountsIndex.AppState>,
    private bankAccountsService: services.BankAccountService,
    private organizationPaymentInstructionService : OrganizationPaymentInstructionService,
    private toaster: services.ToastService,
    private router: Router,
  ) { }

  getOrgBankAccounts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBankAccounts),
    mergeMap(action => this.bankAccountsService.index({ searchOptions: action.params.request })
      .pipe(
        switchMap(response => {
          const items = response.items.map(BankAccount.toModel);
          return [
            actions.GetBankAccountsComplete({ items, agGridParams: action.params, totalRecords: response.totalRecordsCount }),
          ];
        }),
        catchError(error => of(actions.Error(error))),
      )),
  ));

  getOrgBankAccountsComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBankAccountsComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.items, rowCount: action.totalRecords });
    }),
  ), { dispatch: false });

  getBankAccount$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBankAccountDetails),
    mergeMap(action => this.bankAccountsService.get(action.accountId).pipe(
      switchMap(response => [actions.GetBankAccountDetailsComplete({ bankAccount: BankAccount.toModel(response) })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  saveBankAccount$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveBankAccount),
    mergeMap(action => {
      const dto = BankAccount.toDTO(action.bankAccount);
      dto.isUpdateBankAccountNumber = action.isUpdateAccountNumber;
      dto.isUpdateFFCAccount = action.isUpdateFfcAccount;
      dto.isUpdateACHABARoutingNumber = action.isUpdateACHABARoutingNumber;
      return this.bankAccountsService.updateBankAccount(action.bankAccount.id, dto, action.w9File).pipe(
        switchMap(response => [
          actions.SaveBankAccountSuccess({ bankAccount: BankAccount.toModel(response) }),
        ]),
        catchError(error => of(actions.SaveBankAccountError({ error }))),
      );
    }),
  ));

  saveBankAccountField$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveBankAccountField),
    mergeMap(action => {
      return this.bankAccountsService.updateBankAccountField(action.accountId, action.fieldName, action.value).pipe(
        switchMap(response => [
          actions.SaveBankAccountSuccess({ bankAccount: BankAccount.toModel(response) }),
          actions.SaveIndividualFieldSuccess({ fieldName: action.fieldName }),
        ]),
        catchError(error => of(actions.SaveIndividualFieldError({ fieldName: action.fieldName, error }))),
      );
    }),
  ));

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveBankAccountSuccess),
    tap(() => this.toaster.showSuccess('Selected Bank Account was updated')),
  ), { dispatch: false });

  approveBankAccount$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ApproveBankAccount),
    withLatestFrom(this.store.select(selectors.item)),
    filter(([, bankAccount]) => !!bankAccount),
    mergeMap(([, bankAccount]) => this.bankAccountsService.approveBankAccount(bankAccount.id).pipe(
      switchMap(() => [
        actions.ApproveBankAccountComplete(),
        actions.GetBankAccountDetails({ accountId: bankAccount.id }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  approveBankAccountComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ApproveBankAccountComplete),
    tap(() => this.toaster.showSuccess('Bank Account was approved')),
  ), { dispatch: false });

  rejectBankAccount$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RejectBankAccount),
    withLatestFrom(this.store.select(selectors.item)),
    mergeMap(([, bankAccount]) => this.bankAccountsService.rejectBankAccount(bankAccount.id).pipe(
      switchMap(() => [
        actions.RejectBankAccountComplete(),
        actions.GetBankAccountDetails({ accountId: bankAccount.id }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  rejectBankAccount$Complete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RejectBankAccountComplete),
    tap(() => this.toaster.showWarning('Bank Account was rejected', 'Rejected')),
  ), { dispatch: false });

  createBankAccount$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateBankAccount),
    mergeMap(action => this.bankAccountsService.createBankAccount(BankAccount.toDTO(action.bankAccount), action.w9File).pipe(
      map(response => actions.CreateBankAccountComplete({ bankAccount: response })),
      catchError(error => of(actions.CreateBankAccountError({ error }))),
    )),
  ));

  createSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateBankAccountComplete),
    tap(action => {
      this.toaster.showSuccess('Bank Account was created');
      this.router.navigate(
        ['admin', 'user', 'orgs', action.bankAccount.orgId, 'payment-instructions', action.bankAccount.id, 'tabs', 'details'],
        { state: { canEdit: true } },
      );
    }),
  ), { dispatch: false });

  getAccountNumber$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAccountNumber),
    switchMap(({ accountId }) => this.bankAccountsService.getAccountNumber(accountId).pipe(
      map(accountNumber => actions.GetAccountNumberComplete({ accountNumber })),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getFfcAccount$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetFfcAccount),
    switchMap(({ accountId }) => this.bankAccountsService.getFfcAccount(accountId).pipe(
      map(ffcAccount => actions.GetFfcAccountSuccess({ ffcAccount })),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  createPaymentPreference$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreatePaymentPreference),
    mergeMap(({ paymentPreference }) => this.organizationPaymentInstructionService.post(PaymentPreferencesItem.toDto(paymentPreference)).pipe(
      switchMap(() => [
        actions.CreatePaymentPreferenceComplete({ paymentPreference }),
        userAccessPolicieAactions.RefreshPaymentPreferenceList()]),
      catchError(({ error }) => of(actions.Error({ error }))),
    )),
  ));

  createPaymentPreferenceComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreatePaymentPreferenceComplete),
    tap(() => this.toaster.showSuccess('Payment Preference was created')),
  ), { dispatch: false });

  updatePaymentPreference$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdatePaymentPreference),
    mergeMap(({ paymentPreference }) => this.organizationPaymentInstructionService.put(paymentPreference).pipe(
      switchMap(() => [
        actions.UpdatePaymentPreferenceComplete({ paymentPreference }),
        userAccessPolicieAactions.RefreshPaymentPreferenceList()]),
      catchError(({ error }) => of(actions.Error({ error }))),
    )),
  ));

  updatePaymentPreferenceComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdatePaymentPreferenceComplete),
    tap(() => this.toaster.showSuccess('Payment Preference was updated')),
  ), { dispatch: false });

  getBankAccountSettings$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBankAccountSettings),
    mergeMap(action => this.bankAccountsService.getBankAccountSettings(action.orgId).pipe(
      map(settings => actions.GetBankAccountSettingsSuccess({ settings })),
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
