import { Injectable } from "@angular/core";
import { ProjectsService } from "@app/services/api/projects.service";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, mergeMap, of, switchMap, tap } from "rxjs";
import * as FirmLandingPageActions from './actions';
import { Page } from "@app/models/page";
import { IdValue } from "@app/models";
import { PortalDeficiencyService } from "@app/services/api/portal-deficiency.service";
import { ProjectDeficiencyCount } from '@app/models/project-deficiency-count';
import { SaveDocumentGeneratorRequest } from "@app/models/documents";
import isString from 'lodash-es/isString';

import { ToastService } from '@app/services';

@Injectable()
export class FirmLandingPageEffects {
  constructor(
    private readonly actions$: Actions,
    private projectsService: ProjectsService,
    private readonly portalDeficiencyService: PortalDeficiencyService,
    private toaster: ToastService,
  ) {}

  quickSearch$ = createEffect(() => this.actions$.pipe(
    ofType(FirmLandingPageActions.GetProjectsLightList),
    mergeMap(({ params }) => this.projectsService.getProjectCasesList(params).pipe(
      switchMap((response: Page<IdValue>) => [
        FirmLandingPageActions.GetProjectsLightListSuccess({
          projectsLight: response.items,
          totalRecords: response.totalRecordsCount
        })
      ]),
      catchError(error => of(FirmLandingPageActions.Error({ errorMessage: error }))),
    )),
  ));

  getGlobalDeficienciesCount$ = createEffect(() => this.actions$.pipe(
    ofType(FirmLandingPageActions.getGlobalDeficienciesCount),
    mergeMap(() => this.portalDeficiencyService.getGlobalDeficienciesCount().pipe(
      switchMap((response: number) => [
        FirmLandingPageActions.getGlobalDeficienciesCountSuccess({ count: response })
      ]),
      catchError(error => of(FirmLandingPageActions.Error({ errorMessage: error }))),
    )),
  ));

  getGlobalDeficienciesCountForProyects$ = createEffect(() => this.actions$.pipe(
    ofType(FirmLandingPageActions.GetGlobalDeficiencyCountsForProjects),
    mergeMap(() => this.portalDeficiencyService.getPortalDeficienciesCountForProjects().pipe(
      switchMap((response: ProjectDeficiencyCount[]) => [
        FirmLandingPageActions.GetGlobalDeficiencyCountsForProjectsSuccess({ projectDeficiencyCounts: response })
      ]),
      catchError(error => of(FirmLandingPageActions.Error({ errorMessage: error }))),
    )),
  ));

  generateReports$ = createEffect(() => this.actions$.pipe(
    ofType(FirmLandingPageActions.GenerateReports),
    mergeMap(({ projectIds, channelName }) => this.portalDeficiencyService.generateReports(projectIds, channelName).pipe(
      switchMap((generationRequest: SaveDocumentGeneratorRequest) => [FirmLandingPageActions.GenerateReportsComplete({ generationRequest })]),
      catchError(error => of(FirmLandingPageActions.Error({ errorMessage: error }))),
    )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
      ofType(FirmLandingPageActions.Error),
      filter(action => isString(action.errorMessage)),
      tap(data => {
        this.toaster.showError(data.errorMessage);
      }),
    ), { dispatch: false });
}
