/* eslint-disable arrow-body-style */
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { mergeMap, catchError, switchMap, tap, filter } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  ClientsService, ToastService,
} from '@app/services';
import isString from 'lodash-es/isString';
import { DeficiencySummaryOption } from '@app/models/documents/document-generators/deficiency-summary-option';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import * as actions from './actions';

@Injectable()
export class DisbursementWorksheetModalEffects {
  constructor(
    private actions$: Actions,
    private clientsService: ClientsService,
    private toaster: ToastService,
  ) { }

  enqueueDWGeneration$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueDWGeneration),
    mergeMap((action: {
      generatorId: number;
      channelName: string;
    }) => this.clientsService.generateDocumentByDocumentGenerationId(action.generatorId, action.channelName)
      .pipe(
        switchMap(generationRequest => [actions.EnqueueDWGenerationSuccess({ generationRequest })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  validateDocumentGeneration$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ValidateDocumentGeneration),
    mergeMap((action: {
      generationRequest: SaveDocumentGeneratorRequest;
    }) => this.clientsService.validateFeeExpense(action.generationRequest)
      .pipe(
        switchMap(generationRequest => [actions.ValidateDocumentGenerationSuccess({ generationRequest })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  readonly getDocumentGenerationDeficienciesSummary$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentGenerationDeficienciesSummary),
    mergeMap((action: {
      documentGenerationId: number;
    }) => {
      return this.clientsService.getDeficiencySummary(action.documentGenerationId)
        .pipe(
          switchMap((response: DeficiencySummaryOption[]) => {
            return [
              actions.GetDocumentGenerationDeficienciesSummarySuccess({
                requestDeficiencies: response.map(DeficiencySummaryOption.toModel),
              }),
            ];
          }),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    filter((action: {
      error: string;
    }) => isString(action.error)),
    tap((data: {
      error: string;
    }) => this.toaster.showError(data.error)),
  ), { dispatch: false });
}
