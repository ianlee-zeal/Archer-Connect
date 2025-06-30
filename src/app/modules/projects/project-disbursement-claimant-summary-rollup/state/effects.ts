import { Injectable } from '@angular/core';
import { catchError, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { ClaimantsSummaryRollupService } from '@app/services/api/claimants-summary-rollup.service';
import { ClaimantSummaryRollup } from '@app/models/claimant-summary-rollup';
import { ExportName } from '@app/models/enums';
import { ToastService } from '../../../../services/toast-service';
import * as claimantsSummaryRollupActions from './actions';
import * as claimantsSummarySelectors from './selectors';
import { ClaimantsSummaryRollupState } from './reducer';

@Injectable()
export class ClaimantsSummaryRollupEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<ClaimantsSummaryRollupState>,
    private readonly claimantsSummaryRollupService: ClaimantsSummaryRollupService,
    private readonly toaster: ToastService,
  ) { }

  getClaimantsSummaryRollupGrid$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryRollupActions.GetClaimantsSummaryRollupGrid),
    mergeMap(action => this.claimantsSummaryRollupService.getClaimantsSummaryRollup(action.agGridParams.request, action.projectId)
      .pipe(
        switchMap(response => [
          claimantsSummaryRollupActions.GetClaimantsSummaryRollupGridSuccess({
            claimantSummaryRollupList: response.items.map(ClaimantSummaryRollup.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          }),
        ]),
        catchError(error => of(claimantsSummaryRollupActions.Error({ error }))),
      )),
  ));

  getClaimantsSummaryRollupSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryRollupActions.GetClaimantsSummaryRollupGridSuccess),
    tap(action => {
      action.agGridParams?.success({ rowData: action.claimantSummaryRollupList, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  refreshClaimantsSummaryList$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryRollupActions.RefreshClaimantsSummaryRollupGrid),
    withLatestFrom(this.store.select(claimantsSummarySelectors.gridParams)),
    switchMap(([action, agGridParams]) => [
      claimantsSummaryRollupActions.GetClaimantsSummaryRollupGrid({ projectId: action.projectId, agGridParams }),
    ]),
  ));

  downloadClaimantsSummaryRollup$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryRollupActions.DownloadClaimantsSummaryRollup),
    mergeMap(action => this.claimantsSummaryRollupService.export(
      action.id,
      ExportName[ExportName.ClaimantsSummary],
      action.searchOptions,
      action.columns,
      action.channelName,
    ).pipe(
      switchMap(data => [claimantsSummaryRollupActions.DownloadClaimantsSummaryRollupComplete({ channel: data })]),
      catchError(error => of(claimantsSummaryRollupActions.Error({ error }))),
    )),
  ));

  downloadClaimantsSummaryRollupDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsSummaryRollupActions.DownloadClaimantsSummaryRollupDocument),
    mergeMap(action => this.claimantsSummaryRollupService.downloadDocument(action.id).pipe(
      switchMap(() => []),
      catchError(error => of(claimantsSummaryRollupActions.Error({ error }))),
    )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(
      claimantsSummaryRollupActions.Error,
    ),
    map(({ error }) => {
      if (error) {
        this.toaster.showError(error);
      }
    }),
  ), { dispatch: false });
}
