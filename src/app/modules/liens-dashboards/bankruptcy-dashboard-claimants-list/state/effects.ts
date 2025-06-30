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
import * as fromBankruptcyDashboard from '../../bankruptcy-dashboard/state/selectors';
import { LienState } from '../../state/reducer';

@Injectable()
export class BankruptcyDashboardClaimantsListEffects {
  public project$ = this.store$.select(fromBankruptcyDashboard.projectDetails);
  public searchParams$ = this.store$.select(selectors.searchParams);
  public selectedStages$ = this.store$.select(fromBankruptcyDashboard.selectedStages);
  public selectedTypes$ = this.store$.select(fromBankruptcyDashboard.selectedTypes);
  public selectedPhases$ = this.store$.select(fromBankruptcyDashboard.selectedPhases);

  constructor(
    private projectsService: services.ProjectsService,
    private store$: Store<LienState>,
    private actions$: Actions,
    private router: Router,
  ) { }


  getClaimantsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantsList),
    withLatestFrom(this.searchParams$, this.selectedStages$, this.selectedTypes$, this.selectedPhases$),
    mergeMap(([action, searchParams, selectedStages, selectedTypes, selectedPhases]) => {
      const agGridParams = action.agGridParams
        ? action.agGridParams
        : searchParams;

      return this.projectsService.getClientsByBankruptcy(
        agGridParams.request,
        action.projectId,
        action.rootProductCategoryId,
        action.lienTypes || selectedTypes,
        action.lienPhases || selectedPhases,
        action.clientStages || selectedStages,
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
    )),
  ), { dispatch: false });


  downloadClaimants$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadClaimants),
    withLatestFrom(this.project$, this.searchParams$, this.selectedStages$, this.selectedTypes$, this.selectedPhases$),
    mergeMap(([action, projectDetails, searchParams, selectedStages, selectedTypes, selectedPhases]) => {
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
          clientStages: selectedStages || [],
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
