import { Injectable } from '@angular/core';
import { catchError, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { ClaimantsSummaryService } from '@app/services/api/claimants-summary.service';
import { DisbursementClaimantSummary } from '@app/models/disbursement-claimant-summary';
import { ControllerEndpoints, ExportName } from '@app/models/enums';
import { DocumentGenerationService } from '@app/services/api/documents/document-generation.service';
import { TypedAction } from '@ngrx/store/src/models';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { ToastService } from '../../../../services/toast-service';
import * as claimantsSummaryActions from './actions';
import * as claimantsSummarySelectors from './selectors';
import { ClaimantsSummaryState } from './reducer';
import * as projectActions from '../../state/actions';

@Injectable()
export class ClaimantsSummaryEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<ClaimantsSummaryState>,
    private readonly claimantsSummaryService: ClaimantsSummaryService,
    private readonly toaster: ToastService,
    private readonly documentGenerationService: DocumentGenerationService,
  ) { }

  getClaimantsSummaryGrid$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryActions.GetClaimantsSummaryGrid),
    mergeMap(action => this.claimantsSummaryService.getClaimantsSummary(action.agGridParams.request, action.projectId)
      .pipe(
        switchMap(response => [
          claimantsSummaryActions.GetClaimantsSummaryGridSuccess({
            claimantSummaryList: response.items.map(DisbursementClaimantSummary.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          }),
        ]),
        catchError(error => of(claimantsSummaryActions.Error({ error }))),
      )),
  ));

  getClaimantsSummarySuccess$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryActions.GetClaimantsSummaryGridSuccess),
    tap(action => {
      action.agGridParams?.success({ rowData: action.claimantSummaryList, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  refreshClaimantsSummaryList$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryActions.RefreshClaimantsSummaryGrid),
    withLatestFrom(this.store.select(claimantsSummarySelectors.gridParams)),
    switchMap(([action, agGridParams]) => [
      claimantsSummaryActions.GetClaimantsSummaryGrid({ projectId: action.projectId, agGridParams }),
    ]),
  ));

  getPaymentTypesForPaymentRequest$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryActions.GetPaymentTypesForPaymentRequest),
    mergeMap(() => this.claimantsSummaryService.getPaymentTypes()
      .pipe(
        switchMap(paymentTypes => [
          claimantsSummaryActions.GetPaymentTypesSuccess({ paymentTypes }),
          claimantsSummaryActions.GetPaymentTypesForPaymentRequestSuccess({ paymentTypes }),
        ]),
      )),
    catchError(error => of(claimantsSummaryActions.Error({ error }))),
  ));

  downloadClaimantsSummary$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryActions.DownloadClaimantsSummary),
    mergeMap(action => this.claimantsSummaryService.export(
      action.id,
      ExportName[ExportName.ClaimantsSummary],
      action.searchOptions,
      action.columns,
      action.channelName,
    ).pipe(
      switchMap(data => [claimantsSummaryActions.DownloadClaimantsSummaryComplete({ channel: data })]),
      catchError(error => of(claimantsSummaryActions.Error({ error }))),
    )),
  ));

  downloadClaimantsSummaryDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryActions.DownloadClaimantsSummaryDocument),
    mergeMap(action => this.claimantsSummaryService.downloadDocument(action.id).pipe(
      switchMap(() => []),
      catchError(error => of(claimantsSummaryActions.Error({ error }))),
    )),
  ));

  downloadElectronicDeliveryReport$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryActions.DownloadElectronicDeliveryReport),
    mergeMap(action => this.claimantsSummaryService.downloadElectronicDeliveryReport(action.id).pipe(
      switchMap(() => []),
      catchError(error => of(claimantsSummaryActions.Error({ error }))),
    )),
  ));

  loadTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryActions.LoadTemplates),
    mergeMap((action: {
      templateTypes: number[];
      entityTypeId: number;
      documentTypes: number[];
      entityId?: number;
    } & TypedAction<'[Claimants Summary] Load Templates'>) => this.documentGenerationService.getTemplates(action.templateTypes, action.entityTypeId, action.documentTypes, action.entityId).pipe(
      switchMap(data => [
        claimantsSummaryActions.LoadTemplatesComplete({ data }),
      ]),
      catchError(error => of(claimantsSummaryActions.Error({ error }))),
    )),
  ));

  generateDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryActions.GenerateDocuments),
    mergeMap((action: {
      controller: ControllerEndpoints;
      request: SaveDocumentGeneratorRequest;
      id?: number;
    } & TypedAction<'[Claimants Summary] Generate Documents'>) => this.documentGenerationService.generate(action.controller, action.request, action.id)
      .pipe(
        switchMap((generationRequest: SaveDocumentGeneratorRequest) => [projectActions.EnqueueDocumentGenerationSuccess({ generationRequest })]),
        catchError(error => of(claimantsSummaryActions.Error({ error }))),
      )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(
      claimantsSummaryActions.Error,
    ),
    map(({ error }) => {
      if (error) {
        this.toaster.showError(error);
      }
    }),
  ), { dispatch: false });
}
