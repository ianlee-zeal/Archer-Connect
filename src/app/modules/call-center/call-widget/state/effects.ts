import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap, switchMap, withLatestFrom, map, catchError } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, EMPTY } from 'rxjs';
import moment from 'moment-timezone';

import * as services from '@app/services';
import { CommunicationService, ToastService } from '@app/services';
import {
  CommunicationDirection,
  CommunicationPartyType,
  CommunicationResult,
  CommunicationSubject,
} from '@app/models/communication-center';
import { CommonHelper } from '@app/helpers';
import * as actions from './actions';
import * as selectors from './selectors';
import { CallWidgetState } from './reducer';
import { EntityTypeEnum } from '@app/models/enums';

@Injectable()
export class CallWidgetEffects {
  constructor(
    private router: Router,
    private store$: Store<CallWidgetState>,
    private actions$: Actions,
    private communicationService: CommunicationService,
    private toaster: ToastService,
    private communicationDirectionService: services.CommunicationDirectionService,
    private communicationPartyTypeService: services.CommunicationPartyTypeService,
    private communicationResultService: services.CommunicationResultService,
    private communicationSubjectService: services.CommunicationSubjectService,
  ) { }

  startCall$ = createEffect(() => this.actions$.pipe(
    ofType(actions.StartCall),
    tap(() => {
      this.toaster.showInfo('New call was started', null);
    }),
  ), { dispatch: false });

  finishCall$ = createEffect(() => this.actions$.pipe(
    ofType(actions.FinishCall),
    withLatestFrom(this.store$.select(selectors.callInfo)),
    tap(([, callInfo]) => {
      const duration = moment.utc(callInfo.duration * 1000);
      this.toaster.showInfo(`Duration: ${duration.format('HH:mm:ss').toString()}`, 'Call was completed');
    }),
    switchMap(([{ communicationRecord }, callInfo]) => this.communicationService.createCommunicationRecord(communicationRecord)
      .pipe(
        switchMap(() => [actions.FinishCallCompleted({ callInfo })]),
        catchError(error => {
          CommonHelper.windowLog('Error at actions.FinishCall', error);
          return of(actions.Error({ error }));
        }),
      )
    ),
  ));

  finishCallCompleted$ = createEffect(() => this.actions$.pipe(
    ofType(actions.FinishCallCompleted),
    tap(({ callInfo }) => {
      this.toaster.showSuccess('Call was saved');

      switch (callInfo.entityType) {
        case EntityTypeEnum.Clients:
          return this.router.navigate(['claimants', callInfo.entityId, 'overview', 'tabs', 'communications']);
      }
    })
  ), { dispatch: false });

  increaseDuration$ = createEffect(() => this.actions$.pipe(
    ofType(actions.IncreaseCallDuration),
    withLatestFrom(this.store$.select(selectors.callInfo)),
    tap(([, callInfo]) => {
      callInfo.duration = callInfo.duration != null
        ? callInfo.duration + 1
        : 1;

      this.store$.dispatch(actions.UpdateCallInfo({ callInfo }));
    }),
  ), { dispatch: false });

  cancelCall$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CancelCall),
    tap(() => {
      this.toaster.showInfo('Call was canceled', null);
    }),
  ), { dispatch: false });

  getCommunicationDirections$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetCommunicationDirectionListRequest),
    switchMap(() => this.communicationDirectionService.index()
      .pipe(
        map(response => {
          if (response) {
            const data = response.map(x => CommunicationDirection.toModel(x));
            return actions.GetCommunicationDirectionListSuccess({ communicationDirections: data });
          }

          return EMPTY;
        }),
        catchError(() => of(actions.Error)),
      )),
  ));

  getCommunicationParties$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetCommunicationPartyTypeListRequest),
    switchMap(() => this.communicationPartyTypeService.index()
      .pipe(
        map(response => {
          if (response) {
            const data = response.map(x => CommunicationPartyType.toModel(x));
            return actions.GetCommunicationPartyTypeListSuccess({ communicationParties: data });
          }

          return EMPTY;
        }),
        catchError(() => of(actions.Error)),
      )),
  ));

  getCommunicationResultList$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetCommunicationResultListRequest),
    switchMap(({ directionId, methodId }) => this.communicationResultService.index({ directionId, methodId })
      .pipe(
        map(response => {
          if (response) {
            const data = response.map(x => CommunicationResult.toModel(x));
            return actions.GetCommunicationResultListSuccess({ communicationResults: data });
          }

          return EMPTY;
        }),
        catchError(() => of(actions.Error)),
      )),
  ));

  getCommunicationSubjectList$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetCommunicationSubjectListRequest),
    switchMap(({ directionId, methodId }) => this.communicationSubjectService.index({ directionId, methodId })
      .pipe(
        map(response => {
          if (response) {
            const data = response.map(x => CommunicationSubject.toModel(x));
            return actions.GetCommunicationSubjectListSuccess({ communicationSubjects: data });
          }

          return EMPTY;
        }),
        catchError(() => of(actions.Error)),
      )),
  ));
}
