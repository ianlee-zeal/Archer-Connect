import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';

import * as services from '@app/services';
import { MessageService, ToastService } from '@app/services';
import { BillingRule } from '@app/models/billing-rule/billing-rule';
import { BillingRuleTemplate } from '@app/models/billing-rule/billing-rule-template';
import { FeeCap } from '@app/models/billing-rule/fee-cap';
import * as actions from './actions';
import * as selectors from './selectors';
import * as projectSelectors from '../../state/selectors';

@Injectable()
export class BillingRuleEffects {
  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private brService: services.BillingRuleService,
    private coaService: services.ChartOfAccountsService,
    private brtService: services.BillingRuleTemplateService,
    private messageService: MessageService,
    private feeCapService: services.FeeCapService,
    private toaster: ToastService,
  ) { }

  getBillingRule$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetBillingRule),
    mergeMap(action => this.brService.get(action.id)
      .pipe(
        switchMap(response => [actions.GetBillingRuleSuccess({ billingRule: BillingRule.toModel(response) })]),
        catchError(error => [actions.Error(error)]),
      )),
  ));

  createBillingRule$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateBillingRule),
    mergeMap(action => this.brService.post(action.dto)
      .pipe(
        switchMap(response => [
          actions.CreateBillingRuleSuccess({ billingRule: BillingRule.toModel(response) }),
        ]),
        catchError(error => [actions.Error(error)]),
      )),
  ));

  updateBillingRule$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateBillingRule),
    mergeMap(action => this.brService.update(action.dto)
      .pipe(
        switchMap(response => [
          actions.UpdateBillingRuleSuccess({ billingRule: BillingRule.toModel(response) }),
        ]),
        catchError(error => [actions.Error(error)]),
      )),
  ));

  deleteBillingRule$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DeleteBillingRule),
    mergeMap(action => this.messageService.showDeleteConfirmationDialog('Confirm delete', 'Are you sure you want to delete this contract rule?')
      .pipe(switchMap(answer => {
        if (!answer) {
          return EMPTY;
        }

        return this.brService.delete(action.id)
          .pipe(
            switchMap(() => [actions.DeleteBillingRuleSuccess(), actions.RefreshBillingRules()]),
            catchError(error => [actions.Error(error)]),
          );
      }))),
    catchError(error => of(actions.Error(error))),
  ));

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
          catchError(error => [actions.Error(error)]),
        );
    }),
    catchError(error => of(actions.Error(error))),
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
      })
        .pipe(
          switchMap(res => [actions.GetChartOfAccountsSuccess({ chartOfAccounts: res })]),
          catchError(error => [actions.Error(error)]),
        );
    }),
    catchError(error => of(actions.Error(error))),
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
          catchError(error => [actions.Error(error)]),
        );
    }),
    catchError(error => of(actions.Error(error))),
  ));

  searchOrgs$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchOrgs),
    mergeMap(action => this.brService.searchOrgs(action.orgName)
      .pipe(
        switchMap(response => [actions.SearchOrgsSuccess({ orgs: response })]),
        catchError(error => [actions.Error(error)]),
      )),
  ));

  getProjectQsfOrg$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectQsfOrg),
    mergeMap(action => this.brService.getQsfOrgByProject(action.projectId)
      .pipe(
        switchMap(response => [actions.GetProjectQsfOrgSuccess({ projectQsfOrg: response })]),
        catchError(error => [actions.Error(error)]),
      )),
  ));

  searchBillingRules$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchBillingRules),
    mergeMap(action => this.brService.searchBillingRules(action.gridParams.request, action.projectId)
      .pipe(
        switchMap(response => {
          const items = response.items.map(BillingRule.toModel);
          action.gridParams.success({ rowData: items, rowCount: response.totalRecordsCount });
          return [actions.SearchBillingRulesSuccess({ totalRecordsCount: response.totalRecordsCount })];
        }),
        catchError(error => [actions.Error(error)]),
      )),
  ));

  searchBillingRuleTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchBillingRuleTemplates),
    mergeMap(action => this.brService.searchBillingRuleTemplates(action.brtName)
      .pipe(
        switchMap(response => [actions.SearchBillingRuleTemplatesSuccess({ billingRuleTemplates: response.items.map(BillingRuleTemplate.toModel) })]),
        catchError(error => [actions.Error(error)]),
      )),
  ));

  refreshBillingRules$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshBillingRules),
    withLatestFrom(this.store.select(selectors.gridParams), this.store.select(projectSelectors.item)),
    mergeMap(([, gridParams, project]) => [actions.SearchBillingRules({ gridParams, projectId: project.id })]),
    catchError(error => of(actions.Error(error))),
  ));

  searchInjuryCategories$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchInjuryCategories),
    mergeMap(action => this.brService.searchInjuryCategories(action.term)
      .pipe(
        switchMap(res => [actions.SearchInjuryCategoriesSuccess({ injuryCategories: res })]),
        catchError(error => [actions.Error(error)]),
      )),
    catchError(error => of(actions.Error(error))),
  ));

  searchFeeCaps$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchFeeCaps),
    mergeMap(action => this.feeCapService.search(action.feeCapsGridParams.request)
      .pipe(
        switchMap(response => {
          const items = response.items.map(FeeCap.toModel);
          action.feeCapsGridParams.success({ rowData: items, rowCount: response.totalRecordsCount });
          return [actions.SearchFeeCapsSuccess()];
        }),
        catchError(error => [actions.Error(error)]),
      )),
  ));

  createFeeCap$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateFeeCap),
    mergeMap(action => this.feeCapService.post(action.dto)
      .pipe(
        switchMap(response => [
          actions.CreateFeeCapSuccess({ feeCap: FeeCap.toModel(response) }),
          actions.RefreshFeeCaps(),
        ]),
        catchError(error => [actions.Error(error)]),
      )),
  ));

  createFeeCapSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateFeeCapSuccess),
    tap(() => {
      this.toaster.showSuccess('Fee Cap was created');
    }),
  ), { dispatch: false });

  updateFeeCap$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateFeeCap),
    mergeMap(action => this.feeCapService.update(action.dto)
      .pipe(
        switchMap(response => [
          actions.UpdateFeeCapSuccess({ feeCap: FeeCap.toModel(response) }),
          actions.RefreshFeeCaps(),
        ]),
        catchError(error => [actions.Error(error)]),
      )),
  ));

  updateFeeCapSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateFeeCapSuccess),
    tap(() => {
      this.toaster.showSuccess('Fee Cap was updated');
    }),
  ), { dispatch: false });

  refreshFeeCaps$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshFeeCaps),
    withLatestFrom(this.store.select(selectors.feeCapsGridParams)),
    mergeMap(([, feeCapsGridParams]) => [actions.SearchFeeCaps({ feeCapsGridParams })]),
    catchError(error => of(actions.Error(error))),
  ));
}
