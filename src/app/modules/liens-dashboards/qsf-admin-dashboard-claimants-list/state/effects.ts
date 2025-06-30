import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { withLatestFrom, mergeMap, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import * as services from '@app/services';
import { ClientService } from '@app/models';
import { ExportName } from '@app/models/enums';
import * as actions from './actions';
import * as selectors from './selectors';
import * as fromQsfAdminDashboard from '../../qsf-admin-dashboard/state/selectors';
import { LienState } from '../../state/reducer';
import { ClientsForQsfDashboardRequestExport } from '@app/models/liens/clients-for-qsf-dashboard-request-export';

@Injectable()
export class QsfAdminDashboardClaimantsListEffects {
  public searchParams$ = this.store$.select(selectors.searchParams);
  public selectedStages$ = this.store$.select(fromQsfAdminDashboard.selectedStatuses);
  public selectedPhases$ = this.store$.select(fromQsfAdminDashboard.selectedPhases);

  constructor(
    private projectsService: services.ProjectsService,
    private store$: Store<LienState>,
    private actions$: Actions,
    private router: Router,
    private readonly toasterService: services.ToastService,
  ) { }

  getClaimantsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantsList),
    withLatestFrom(this.searchParams$, this.selectedStages$, this.selectedPhases$),
    mergeMap(([action, searchParams, selectedStages, selectedPhases]) => {
      const agGridParams = action.agGridParams
        ? action.agGridParams
        : searchParams;

      return this.projectsService.getClientsForQsfAdmin(
        agGridParams.request,
        action.projectId,
        action.lienPhases || selectedPhases,
        action.clientStages || selectedStages,
        action.bypassSpinner,
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
      [`claimants/${action.claimantDetailsRequest.id}`],
    )),
  ), { dispatch: false });

  downloadClaimants$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadClaimants),
    withLatestFrom(this.searchParams$, this.selectedStages$, this.selectedPhases$),
    mergeMap(([action, searchParams, selectedStages, selectedPhases]) => {
      const agGridParams = action.agGridParams
        ? action.agGridParams
        : searchParams;

      const requestParams: ClientsForQsfDashboardRequestExport = {
        name: ExportName[ExportName.Claimants],
        columns: action.columns,
        channelName: action.channelName,
        clientLiens: {
          attorneyPaymentStatuses: selectedPhases || [],
          clientStages: selectedStages || [],
          searchOptions: agGridParams.request,
        },
      };

      return this.projectsService.exportClientsForQsfAdmin(action.projectId, requestParams).pipe(
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

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap(data => {
      this.toasterService.showError(data.errorMessage);
    }),
  ), { dispatch: false });
}
