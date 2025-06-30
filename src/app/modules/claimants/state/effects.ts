import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Store } from '@ngrx/store';
import { PacketRequestService } from '@app/services/api/packet-request.service';
import { of } from 'rxjs';
import { IdValue } from '@app/models';
import * as claimantsActions from './actions';
import * as claimantsSelectors from './selectors';
import { ClaimantsState } from './reducer';

@Injectable()
export class ClaimantEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<ClaimantsState>,
    private readonly router: Router,
    private packetRequestService: PacketRequestService,
  ) { }

  gotoClaimantDetails$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsActions.GoToClaimantDetails),
    withLatestFrom(this.store.select(claimantsSelectors.gridParamsRequest)),
    tap(([action, gridParamsRequest]) => this.router.navigate(
      [`claimants/${action.id}`],
      {
        state: {
          navSettings: action.navSettings,
          gridParamsRequest,
        },
      },
    )),
  ), { dispatch: false });

  goToClaimantsListPage$ = createEffect(() => this.actions$.pipe(
    ofType(claimantsActions.GoToClaimantsListPage),
    tap(() => this.router.navigate(['claimants'])),
  ), { dispatch: false });

  missingDocsOptions$ = createEffect((): any => this.actions$.pipe(
    ofType(claimantsActions.GetAllMissingDocs),
    mergeMap(() => this.packetRequestService.getAllMissingDocs()
      .pipe(
        switchMap((response: IdValue[]) => [
          claimantsActions.GetAllMissingDocsSuccess({ missingDocsOptions: response }),
        ]),
        catchError(error => of(claimantsActions.Error({ errorMessage: error }))),
      )),
  ));

  docsToSendOptions$ = createEffect((): any => this.actions$.pipe(
    ofType(claimantsActions.GetAllDocsToSend),
    mergeMap(() => this.packetRequestService.getAllDocsToSend()
      .pipe(
        switchMap((response: IdValue[]) => [
          claimantsActions.GetAllDocsToSendSuccess({ docsToSendOptions: response }),
        ]),
        catchError(error => of(claimantsActions.Error({ errorMessage: error }))),
      )),
  ));

  documentsByProbateId$ = createEffect((): any => this.actions$.pipe(
    ofType(claimantsActions.GetDocumentsByProbateId),
    mergeMap(action => this.packetRequestService.getDocumentsByProbateId(action.probateId)
      .pipe(
        switchMap((response: IdValue[]) => [
          claimantsActions.GetDocumentsByProbateIdSuccess({ allDocuments: response }),
        ]),
        catchError(error => of(claimantsActions.Error({ errorMessage: error }))),
      )),
  ));
}
