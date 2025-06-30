import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, withLatestFrom, tap, filter } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

import * as services from '@app/services';
import { BillingRuleTemplate } from '@app/models/billing-rule/billing-rule-template';
import { MessageService, ToastService } from '@app/services';
import { Router } from '@angular/router';
import * as actions from './actions';
import * as selectors from './selectors';

@Injectable()
export class BillingRuleTemplateEffects {
  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private brtService: services.BillingRuleTemplateService,
    private brService: services.BillingRuleService,
    private coaService: services.ChartOfAccountsService,
    private obsService: services.OutcomeBasedScenarioService,
    private messageService: MessageService,
    private toaster: ToastService,
    protected readonly router: Router,
  ) { }

  getBillingRuleTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBillingRuleTemplate),
    mergeMap(action => this.brtService.get(action.id)
      .pipe(
        switchMap(response => [actions.GetBillingRuleTemplateSuccess({ billingRuleTemplate: BillingRuleTemplate.toModel(response) })]),
        catchError(error => [actions.Error({ error })]),
      )),
  ));

  createBillingRuleTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateBillingRuleTemplate),
    mergeMap(action => this.brtService.post(action.dto)
      .pipe(
        switchMap(response => [
          actions.CreateBillingRuleTemplateSuccess({ billingRuleTemplate: BillingRuleTemplate.toModel(response) }),
          actions.RefreshBillingRuleTemplates(),
          actions.GoToBillingRuleTemplate({ billingRuleTemplateId: response.id }),
        ]),
        catchError(error => [actions.Error({ error })]),
      )),
  ));

  updateBillingRuleTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateBillingRuleTemplate),
    mergeMap(action => this.brtService.put(action.dto)
      .pipe(
        switchMap(response => [
          actions.UpdateBillingRuleTemplateSuccess({ billingRuleTemplate: BillingRuleTemplate.toModel(response) }),
          actions.RefreshBillingRuleTemplates(),
        ]),
        catchError(error => [actions.Error({ error })]),
      )),
  ));

  deleteBillingRuleTemplate$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DeleteBillingRuleTemplate),
    mergeMap(action => this.messageService.showDeleteConfirmationDialog('Confirm delete', 'Are you sure you want to delete this contract rule template?')
      .pipe(switchMap(answer => {
        if (!answer) {
          return EMPTY;
        }

        return this.brtService.delete(action.id)
          .pipe(
            switchMap(() => [
              actions.DeleteBillingRuleTemplateSuccess(),
              actions.RefreshBillingRuleTemplates(),
              actions.GoToBillingRuleTemplateList(),
            ]),
            catchError(error => [actions.Error({ error })]),
          );
      }))),
    catchError(error => [actions.Error({ error })]),
  ));

  goToBillingRuleTemplateList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToBillingRuleTemplateList),
    tap(() => this.router.navigate(['admin', 'contract-rule-templates'])),
  ), { dispatch: false });

  goToBillingRuleTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToBillingRuleTemplate),
    tap(action => this.router.navigate(['admin', 'contract-rule-templates', `${action.billingRuleTemplateId}`])),
  ), { dispatch: false });

  getBillingRuleTemplateStatuses$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBillingRuleTemplateStatuses),
    withLatestFrom(this.store.select(selectors.statuses)),
    mergeMap(([, statuses]) => {
      if (statuses && statuses.length) {
        return [actions.GetBillingRuleTemplateStatusesSuccess({ statuses })];
      }

      return this.brtService.getBrtStatuses()
        .pipe(
          switchMap(response => [actions.GetBillingRuleTemplateStatusesSuccess({ statuses: response })]),
          catchError(error => [actions.Error({ error })]),
        );
    }),
    catchError(error => [actions.Error({ error })]),
  ));

  searchInvoicingItems$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchInvoicingItems),
    mergeMap(action => this.brtService.searchInvoicingItems(action.searchTerm)
      .pipe(
        switchMap(response => [actions.SearchInvoicingItemsSuccess({ items: response.items })]),
        catchError(error => [actions.Error({ error })]),
      )),
  ));

  searchRevRecItems$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchRevRecItems),
    mergeMap(action => this.brtService.searchRevRecItems(action.searchTerm)
      .pipe(
        switchMap(response => [actions.SearchRevRecItemsSuccess({ items: response.items })]),
        catchError(error => [actions.Error({ error })]),
      )),
  ));

  getRevRecMethods$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetRevRecMethods),
    withLatestFrom(this.store.select(selectors.revRecMethods)),
    mergeMap(([, methods]) => {
      if (methods && methods.length) {
        return [actions.GetRevRecMethodsSuccess({ methods })];
      }

      return this.brtService.getRevRecMethods()
        .pipe(
          switchMap(response => [actions.GetRevRecMethodsSuccess({ methods: response })]),
          catchError(error => [actions.Error({ error })]),
        );
    }),
    catchError(error => [actions.Error({ error })]),
  ));

  searchBillingRuleTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchBillingRuleTemplates),
    mergeMap(action => this.brtService.searchBillingRuleTemplates(action.gridParams.request)
      .pipe(
        switchMap(response => {
          action.gridParams.success({ rowData: response.items.map(BillingRuleTemplate.toModel), rowCount: response.totalRecordsCount });
          return [actions.SearchBillingRuleTemplatesSuccess()];
        }),
        catchError(error => [actions.Error({ error })]),
      )),
  ));

  refreshBillingRuleTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshBillingRuleTemplates),
    withLatestFrom(this.store.select(selectors.gridParams)),
    mergeMap(([, gridParams]) => [actions.SearchBillingRuleTemplates({ gridParams })]),
    catchError(error => [actions.Error({ error })]),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    filter(action => typeof action?.error === 'string'),
    tap(action => {
      this.toaster.showError(action.error);
    }),
  ), { dispatch: false });

  getFeeScopes$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetFeeScopes),
    withLatestFrom(this.store.select(selectors.feeScopes)),
    mergeMap(([, feeScopes]) => {
      if (feeScopes && feeScopes.length) {
        return [actions.GetFeeScopesSuccess({ feeScopes })];
      }

      return this.brService.getFeeScopes()
        .pipe(
          switchMap(res => [actions.GetFeeScopesSuccess({ feeScopes: res })]),
          catchError(error => [actions.Error({ error })]),
        );
    }),
    catchError(error => [actions.Error({ error })]),
  ));

  getChartOfAccounts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetChartOfAccounts),
    withLatestFrom(this.store.select(selectors.chartOfAccounts)),
    mergeMap(([, chartOfAccounts]) => {
      if (chartOfAccounts && chartOfAccounts.length) {
        return [actions.GetChartOfAccountsSuccess({ chartOfAccounts })];
      }

      return this.coaService.getChartOfAccountsLight({ endRow: -1,
        FilterModel: [{
          Key: 'AccountGroupNo',
          Type: 1,
          Filter: '52000',
          FilterType: 0,
        }],
      }) // we need all the charts with AccountGroupNo == 52000
        .pipe(
          switchMap(res => [actions.GetChartOfAccountsSuccess({ chartOfAccounts: res })]),
          catchError(error => [actions.Error({ error })]),
        );
    }),
    catchError(error => [actions.Error({ error })]),
  ));
}
