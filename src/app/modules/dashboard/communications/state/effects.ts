import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommunicationRecord } from '@app/models/communication-center/communication-record';
import { CommunicationService } from '@app/services';
import { EntityTypeEnum, ExportName } from '@app/models/enums';
import { Router } from '@angular/router';
import { actions } from '.';

@Injectable()
export class GlobalCommunicationSearchEffects {
  constructor(
    private communicationService: CommunicationService,
    private actions$: Actions,
    private router: Router,
  ) { }

  getGlobalCommunicationSearchList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetGlobalCommunicationSearchListRequest),
    mergeMap(action => this.communicationService.search(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetGlobalCommunicationSearchListSuccess({
            communications: response.items.map(CommunicationRecord.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetGlobalCommunicationSearchListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  getGlobalCommunicationSearchListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetGlobalCommunicationSearchListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.communications, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  downloadCommunications$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadCommunications),
    mergeMap(action => this.communicationService.export(
      ExportName[ExportName.Communications],
      action.searchOptions,
      action.columns,
      action.channelName,
    ).pipe(
      switchMap(data => [actions.DownloadCommunicationsComplete({ channel: data })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  downloadDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadCommunicationsDocument),
    mergeMap(action => this.communicationService.downloadDocument(action.id).pipe(
      switchMap(() => []),
    )),
  ));

  goToCommunication$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToCommunication),
    tap(action => {
      switch (action.entityTypeId) {
        case EntityTypeEnum.Clients:
          this.router.navigate(['claimants', action.entityId, 'overview', 'tabs', 'communications', action.id, action.canReadNotes ? 'notes' : 'related-documents']);
          break;
        case EntityTypeEnum.Projects:
          this.router.navigateByUrl(`projects/${action.entityId}/overview/tabs/communications/${action.id}/notes`);
          break;
      }
    }),
  ), { dispatch: false });
}
