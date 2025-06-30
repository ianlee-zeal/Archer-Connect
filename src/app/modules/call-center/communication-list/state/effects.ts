import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, tap } from 'rxjs/operators';
import * as services from '@app/services';
import { of } from 'rxjs';

import { CommunicationRecord } from '@app/models/communication-center/communication-record';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ProjectCommunicationRecord } from '@app/models/communication-center/project-communication-record';
import { GetCommunicationRecordRequest } from '../../communication/state/actions';
import * as actions from './actions';

@Injectable()
export class CommunicationListEffects {
  constructor(
    private readonly communicationService: services.CommunicationService,
    private projectCommunicationService: services.ProjectCommunicationService,
    private readonly actions$: Actions,
  ) { }

  getCommunicationListRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetCommunicationListRequest),
    mergeMap(action => {
      const service = action.entity && action.entity === GridId.Projects ? this.projectCommunicationService : this.communicationService;
      return service.index({
        searchOptions: action.payload.agGridParams?.request,
        entityType: action.payload.entityType,
        entityId: action.payload.entityId,
      }).pipe(
        switchMap(response => {
          const model = action.entity && action.entity === GridId.Projects ? ProjectCommunicationRecord : CommunicationRecord;
          const communications = response.items.map(item => model.toModel(item));

          const result = [];
          if (action.payload.forPaging && communications.length) {
            result.push(GetCommunicationRecordRequest({ communicationRecordId: communications[0].id }));
          } else {
            result.push(actions.GetCommunicationListSuccess({
              communications,
              agGridParams: action.payload.agGridParams,
              totalRecords: response.totalRecordsCount,
            }));
          }
          return result;
        }),
        catchError(error => of(actions.GetCommunicationListError({
          errorMessage: error,
          agGridParams: action.payload.agGridParams,
        }))),
      );
    }),
  ));

  getCommunicationListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetCommunicationListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.communications, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getCommunicationListError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetCommunicationListError),
    tap(action => {
      console.error(action.errorMessage); // eslint-disable-line no-console
      action.agGridParams.fail();
    }),
  ), { dispatch: false });
}
