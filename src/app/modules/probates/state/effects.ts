/* eslint-disable arrow-body-style */
import { ToastService } from '@app/services';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { mergeMap, catchError, tap, switchMap, map } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { ExportName, ProductCategory } from '@app/models/enums';
import { Router } from '@angular/router';
import { PacketRequestService } from '@app/services/api/packet-request.service';
import { ProbatesService } from '../../../services/api/probates.service';
import * as actions from './actions';
import { ProbateDetails } from '../../../models';

@Injectable()
export class ProbatesEffects {
  constructor(
    private readonly probatesService: ProbatesService,
    private readonly packetRequestService: PacketRequestService,
    private readonly actions$: Actions,
    private readonly toasterService: ToastService,
    private readonly router: Router,
  ) { }

  getProbates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProbatesList),
    mergeMap(action => this.probatesService.search(action.probatesGridParams.request)
      .pipe(
        switchMap(response => {
          const probates = response.items.map(ProbateDetails.toModel);
          return [actions.GetProbatesListSuccess({
            probates,
            probatesGridParams: action.probatesGridParams,
            totalRecords: response.totalRecordsCount,
          })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProbatesSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProbatesListSuccess),
    tap(action => {
      action.probatesGridParams.success({ rowData: action.probates, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  downloadProbates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadProbates),
    mergeMap(action => {
      return this.probatesService.export(ExportName[ExportName.Probates], action.searchOptions, action.columns, action.channelName).pipe(
        switchMap(data => [actions.DownloadProbatesComplete({ channel: data })]),
        catchError(error => of(actions.Error({ error }))),
      );
    }),
  ));

  enqueueGenerateFirmUpdate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EnqueueGenerateFirmUpdate),
    mergeMap(action => {
      return this.probatesService.generateFirmUpdate(ExportName[ExportName.Probates], action.columns, action.channelName, action.projectId).pipe(
        switchMap(channel => [actions.EnqueueGenerateFirmUpdateSuccess({ channel })]),
        catchError(error => of(actions.Error({ error }))),
      );
    }),
  ));

  exportPendingPacketRequests$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ExportPendingPacketRequests),
    mergeMap(action => {
      return this.packetRequestService.exportPendingPacket(ExportName[ExportName.Probates], action.columns, action.channelName, action.statusesIds).pipe(
        switchMap(channel => [actions.ExportPendingPacketRequestsSuccess({ channel })]),
        catchError(error => of(actions.Error({ error }))),
      );
    }),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap(data => {
      this.toasterService.showError(data.error);
    }),
  ), { dispatch: false });

  downloadDocuments$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DownloadProbatesDocument),
    mergeMap(action => this.probatesService.downloadDocument(action.id).pipe(
      switchMap(() => []),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  gotoProbateDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToProbateDetails),
    tap(action => this.router.navigate([`/claimants/${action.clientId}/services/${ProductCategory.Probate}/tabs/details`])),
  ), { dispatch: false });

  goToProbatesListPage$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToProbatesListPage),
    tap(() => this.router.navigate(['/probates'])),
  ), { dispatch: false });

  getProjectsWithProbates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectsWithProbates),
    mergeMap(action => this.probatesService.getProjectNamesWithProbates(action.searchTerm)
      .pipe(
        switchMap(response => {
          const projectsWithProbates = response;
          return [actions.GetProjectsWithProbatesSuccess({ projectsWithProbates })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getProjectsCodesWithProbates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectsCodesWithProbates),
    mergeMap(action => this.probatesService.getProjectCodesWithProbates(action.searchTerm)
      .pipe(
        switchMap(response => {
          const projectsCodesWithProbates = response.map(id => {
            const selectOption = { id, name: id };
            return selectOption;
          });
          return [actions.GetProjectsCodesWithProbatesSuccess({ projectsCodesWithProbates })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getPacketRequestsStages$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPacketRequestsStages),
    switchMap(() => this.packetRequestService.getStatuses().pipe(
      map(stages => {
        return actions.GetPacketRequestsStagesSuccess({ packetRequestsStages: stages });
      }),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));
}
