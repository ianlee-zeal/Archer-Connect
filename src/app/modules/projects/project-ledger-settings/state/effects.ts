import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, tap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

import { Store } from '@ngrx/store';
import { EntityTypeEnum } from '@app/models/enums';
import { ClaimSettlementLedgerSettingsService, OrgTypesService, ProductsService, ToastService } from '@app/services';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings/claim-settlement-ledger-settings';

import { LedgerSettingsState } from './reducer';
import * as actions from './actions';

@Injectable()
export class LedgeSettingsEffects {
  constructor(
    private claimSettlementLedgerSettingsService: ClaimSettlementLedgerSettingsService,
    private productsService: ProductsService,
    private orgTypesService: OrgTypesService,
    private actions$: Actions,
    private store: Store<LedgerSettingsState>,
    private toaster: ToastService,
  ) { }

  loadData$ = createEffect(() => this.actions$.pipe(
    ofType(actions.LoadData),
    // eslint-disable-next-line @typescript-eslint/typedef
    mergeMap(action => forkJoin(
      this.claimSettlementLedgerSettingsService.getByProjectId(action.projectId),
      this.claimSettlementLedgerSettingsService.getDocumentImportTemplates(),
      this.claimSettlementLedgerSettingsService.getFormulaSets(),
      this.claimSettlementLedgerSettingsService.getElectronicDeliveryProviders(),
      this.productsService.getQSFProducts(),
      this.claimSettlementLedgerSettingsService.getClosingStatementTemplates(action.projectId, action.isProjectAssociated),
      this.claimSettlementLedgerSettingsService.getFormulaModes(),
      this.orgTypesService.getfirmMoneyMovementOptions(),
      this.claimSettlementLedgerSettingsService.getDigitalPaymentProvidersOptions(),
    ).pipe(
      switchMap(([
        claimSettlementLedgerSettings,
        documentImportTemplates,
        formulaSets,
        electronicDeliveryProviders,
        qsfProducts,
        closingStatementTemplates,
        formulaModes,
        firmMoneyMovementOptions,
        digitalPaymentProvidersOptions,
      ]) => [
        actions.LoadDataComplete({
          claimSettlementLedgerSettings: ClaimSettlementLedgerSettings.toModel(claimSettlementLedgerSettings),
          documentImportTemplates,
          formulaSets,
          electronicDeliveryProviders,
          qsfProducts,
          closingStatementTemplates,
          formulaModes,
          firmMoneyMovementOptions,
          digitalPaymentProvidersOptions,
        }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  updateClaimantSettlementLedgerSettings$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.CreateOrUpdateClaimantSettlementLedgerSettings),
    mergeMap(action => (action.claimSettlementLedgerSettings.id
      ? this.claimSettlementLedgerSettingsService.update(EntityTypeEnum.Projects, action.claimSettlementLedgerSettings)
      : this.claimSettlementLedgerSettingsService.post(action.claimSettlementLedgerSettings))
      .pipe(
        switchMap(response => {
          const claimSettlementLedgerSettings = ClaimSettlementLedgerSettings.toModel(response);
          this.toaster.showSuccess(action.claimSettlementLedgerSettings.id ? 'Ledger Settings Updated' : 'Ledger Settings Created');
          return [
            actions.CreateOrUpdateLedgerSettingsComplete({ claimSettlementLedgerSettings }),
            actions.LoadOnlyClosingStatementSettings({ projectId: claimSettlementLedgerSettings.entityId, isProjectAssociated: action.isProjectAssociated }),
          ];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  loadOnlyClosingStatementSettings$ = createEffect(() => this.actions$.pipe(
    ofType(actions.LoadOnlyClosingStatementSettings),
    mergeMap(action => this.claimSettlementLedgerSettingsService.getByProjectId(action.projectId).pipe(
      switchMap(result => [
        actions.LoadOnlyClosingStatementSettingsComplete({
          claimSettlementLedgerSettings: ClaimSettlementLedgerSettings.toModel(result),
        }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap(({ error }) => {
      this.toaster.showError(error);
    }),
  ), { dispatch: false });
}
