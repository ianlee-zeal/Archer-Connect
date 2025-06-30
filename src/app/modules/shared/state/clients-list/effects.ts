import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { ExportName } from '@app/models/enums';
import { ClientsService, ToastService } from '@app/services';

import { ClientsListState } from './reducer';
import * as clientsListActions from './actions';

@Injectable()
export class ClientsListEffects {
  constructor(
    private clientsService: ClientsService,
    private actions$: Actions,
    private toaster: ToastService,
    private store$: Store<ClientsListState>,
  ) { }

  getAGPersonsList$ = createEffect((): any => this.actions$.pipe(
    ofType(clientsListActions.GetAGClients),
    mergeMap(action => this.clientsService.search(action.params.request)
      .pipe(
        switchMap(response => [clientsListActions.GetAGClientsComplete({
          items: response.items,
          params: action.params,
          totalRecords: response.totalRecordsCount,
        })]),
        catchError(error => of(clientsListActions.Error({ error }))),
      )),
  ));


  getAGClientsListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(clientsListActions.GetAGClientsComplete),
    tap(action => {
      action.params.success({ rowData: action.items, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  deleteClients$ = createEffect((): any => this.actions$.pipe(ofType(clientsListActions.DeleteClients),
    mergeMap(action => this.clientsService.deleteAll(action.ids).pipe(
      switchMap(() => {
        action.callback();
        return [clientsListActions.DeleteClientsComplete()];
      }),
      catchError(error => of(clientsListActions.Error({ error }))),
    ))));

  deleteClientsuccess$ = createEffect(() => this.actions$.pipe(ofType(clientsListActions.DeleteClientsComplete),
    tap(() => {
      this.toaster.showSuccess('Selected clients were deleted');
    })
  ), { dispatch: false });

  downloadClients$ = createEffect(() => this.actions$.pipe(
    ofType(clientsListActions.DownloadClients),
    mergeMap(action => this.clientsService.export(ExportName[ExportName.Claimants], action.channelName, action.agGridParams.request, action.columns).pipe(
      switchMap(data => [clientsListActions.DownloadClientsComplete({ channel: data })]),
      catchError(error => of(clientsListActions.Error({ error }))),
    )),
  ));


  downloadDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(clientsListActions.DownloadClientsDocument),
    mergeMap(action => this.clientsService.downloadDocument(action.id).pipe(
      switchMap(() => []),
      catchError(error => of(clientsListActions.Error({ error }))),
    )),
  ));


  error$ = createEffect(() => this.actions$.pipe(ofType(clientsListActions.Error),
    tap(data => {
      this.toaster.showError(data.error.message);
    })
  ), { dispatch: false });
}
