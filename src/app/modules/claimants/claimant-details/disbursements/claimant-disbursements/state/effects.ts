import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { mergeMap, map, catchError, tap, switchMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { ClientsService } from '@app/services';
import { ClaimantDisbursementGroup } from '@app/models/claimant-disbursement-group';
import { ExportName } from '@app/models/enums';
import { DownloadClientDisbursementGroupsDocument, ExportClientDisbursementGroupsRequest, ExportClientDisbursementGroupsSuccess, GetClaimantDisbursementGroupListRequest, GetClaimantDisbursementGroupListSuccess } from './actions';
import * as claimantActions from '../../../state/actions';

@Injectable()
export class ClaimantDisbursementListEffects {
  constructor(
    private actions$: Actions,
    private clientsService: ClientsService,
  ) { }

  getDisbursementGrid$ = createEffect(() => this.actions$.pipe(
    ofType(GetClaimantDisbursementGroupListRequest),
    mergeMap(({ agGridParams, clientId }) => this.clientsService.getDisbursementGroupList(clientId, agGridParams.request)
      .pipe(
        map(response => GetClaimantDisbursementGroupListSuccess({
          disbursementGroupList: response.items.map(ClaimantDisbursementGroup.toModel),
          agGridParams,
          totalRecords: response.totalRecordsCount,
        })),
        catchError(error => of(claimantActions.Error({ error }))),
      )),
  ));

  GetDisbursementGridSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(GetClaimantDisbursementGroupListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.disbursementGroupList, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  downloadDisbursementGroupClaimants$ = createEffect(() => this.actions$.pipe(
    ofType(ExportClientDisbursementGroupsRequest),
    mergeMap(({ clientId, agGridParams, columns, channelName }) => this.clientsService.exportDisbursementGroups(clientId, ExportName[ExportName.ClaimantDisbursementGroups], agGridParams.request, columns, channelName).pipe(
      map(() => ExportClientDisbursementGroupsSuccess()),
      catchError(error => of(claimantActions.Error({ error }))),
    )),
  ));

  downloadDisbursementGroupClaimantDocument$ = createEffect(() => this.actions$.pipe(
    ofType(DownloadClientDisbursementGroupsDocument),
    mergeMap(action => this.clientsService.downloadDisbursementGroupsDocument(action.id).pipe(
      switchMap(() => []),
      catchError(error => of(claimantActions.Error({ error }))),
    )),
  ));
}
