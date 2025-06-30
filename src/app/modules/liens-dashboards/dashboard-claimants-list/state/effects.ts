import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { withLatestFrom, mergeMap, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import * as services from '@app/services';
import { ClientService } from '@app/models';
import { ExportName } from '@app/models/enums';
import { ClientLiensRequestExport } from '@app/models/liens/client-liens-request-export';
import * as actions from './actions';
import * as selectors from './selectors';
import * as fromProbateDashboard from '../../probate-dashboard/state/selectors'; // change to dynamic by dashboard
import { LienState } from '../../state/reducer';

@Injectable()
export class DashboardClaimantsListEffects {
  public project$ = this.store$.select(fromProbateDashboard.projectDetails);
  public searchParams$ = this.store$.select(selectors.searchParams);
  public selectedStatuses$ = this.store$.select(fromProbateDashboard.selectedStatuses);
  public selectedTypes$ = this.store$.select(fromProbateDashboard.selectedTypes);
  public selectedPhases$ = this.store$.select(fromProbateDashboard.selectedPhases);

  constructor(
    private projectsService: services.ProjectsService,
    private store$: Store<LienState>,
    private actions$: Actions,
    private router: Router,
  ) { }

  getClaimantsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantsList),
    withLatestFrom(this.searchParams$, this.selectedStatuses$, this.selectedTypes$, this.selectedPhases$),
    mergeMap(([action, searchParams, selectedStatuses, selectedTypes, selectedPhases]) => {
      const agGridParams = action.agGridParams
        ? action.agGridParams
        : searchParams;

      return this.projectsService.getClientsByProbate(
        agGridParams.request,
        action.projectId,
        action.rootProductCategoryId,
        action.lienTypes || selectedTypes,
        action.lienPhases || selectedPhases,
        action.clientStatuses || selectedStatuses,
      )
        .pipe(
          switchMap(response => [actions.GetClaimantsListSuccess({
            clients: response.items.map(item => ClientService.toModel(item)),
            totalRecords: response.totalRecordsCount,
            agGridParams,
          }),
          ]),
          catchError(errorMessage => of(actions.Error({
            errorMessage,
            agGridParams,
          }))),
        );
    }),
  ));

  getClientListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantsListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.clients, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  gotoClaimantDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToClaimantDetails),
    tap(action => this.router.navigate(
      [`claimants/${action.claimantDetailsRequest.id}/services/${action.claimantDetailsRequest.rootProductCategoryId}/tabs/summary`],
      {
        state: {
          projectId: action.claimantDetailsRequest.projectId,
          navSettings: action.claimantDetailsRequest.navSettings,
          gridParamsRequest: action.claimantDetailsRequest.gridParamsRequest,
          rootProductCategoryId: action.claimantDetailsRequest.rootProductCategoryId,
        },
      },
    )),
  ), { dispatch: false });

  downloadClaimants$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadClaimants),
    withLatestFrom(this.project$, this.searchParams$, this.selectedStatuses$, this.selectedTypes$, this.selectedPhases$),
    mergeMap(([action, projectDetails, searchParams, selectedStatuses, selectedTypes, selectedPhases]) => {
      const agGridParams = action.agGridParams
        ? action.agGridParams
        : searchParams;

      const requestParams: ClientLiensRequestExport = {
        name: ExportName[ExportName.Claimants],
        columns: action.columns,
        channelName: action.channelName,
        clientLiens: {
          rootProductCategoryId: action.rootProductCategoryId,
          lienTypeGroups: selectedTypes || [],
          lienPhases: selectedPhases || [],
          clientStages: selectedStatuses || [],
          searchOptions: agGridParams.request,
        },
      };
      return this.projectsService.exportClients(projectDetails.id, requestParams).pipe(
        switchMap(() => [actions.DownloadClaimantsComplete()]),
        catchError(errorMessage => of(actions.Error({ errorMessage }))),
      );
    }),
  ));

  downloadDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadClaimantsDocument),
    mergeMap(action => this.projectsService.downloadDocument(action.id).pipe(
      catchError(errorMessage => of(actions.Error({ errorMessage }))),
    )),
  ), { dispatch: false });
}
