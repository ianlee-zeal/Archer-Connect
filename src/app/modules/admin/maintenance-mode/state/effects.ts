import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, tap, filter } from 'rxjs/operators';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MaintenanceService } from '@app/services/api/maintenance.service';
import { Maintenance } from '@app/models/admin/maintenance';
import { MaintenanceBanner } from '@app/models/admin/maintenance-banner';
import { ToastService } from '@app/services';
import * as actions from './actions';

@Injectable()
export class MaintenanceEffects {
  constructor(
    private actions$: Actions,
    private maintenanceService: MaintenanceService,
    private toaster: ToastService,
    protected readonly router: Router,
  ) { }

  getMaintenanceList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetMaintenanceList),
    mergeMap(() => this.maintenanceService.getAll().pipe(
      switchMap((response: Maintenance[]) => [
        actions.GetMaintenanceListSuccess({ maintenanceList: response }),
      ]),
      catchError((error: string) => of(actions.Error({ error }))),
    )),
  ));

  updateMaintenanceList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateMaintenanceList),
    mergeMap(action => this.maintenanceService.updateMaintenanceList(action.maintenanceList).pipe(
      switchMap((response: Maintenance[]) => [
        actions.UpdateMaintenanceListSuccess({ maintenanceList: response }),
      ]),
      catchError((error: string) => of(actions.Error({ error }))),
    )),
  ));

  updateMaintenanceListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateMaintenanceListSuccess),
    tap(() => this.toaster.showSuccess('Maintenance was saved')),
  ), { dispatch: false });

  updateMaintenanceBanner$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateMaintenanceBanner),
    mergeMap(action => this.maintenanceService.updateBanner(action.maintenanceBanner).pipe(
      switchMap(() => [
        actions.GetMaintenanceBannerList(),
      ]),
      catchError((error: string) => of(actions.Error({ error }))),
    )),
  ));

  getMaintenanceBannerList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetMaintenanceBannerList),
    mergeMap(() => this.maintenanceService.getMaintenanceBannerList().pipe(
      switchMap((response: MaintenanceBanner[]) => [
        actions.GetMaintenanceBannerListSuccess({ maintenanceBannerList: response }),
      ]),
      catchError((error: string) => of(actions.Error({ error }))),
    )),
  ));

  updateMaintenanceOperation$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateMaintenanceOperation),
    mergeMap(action => this.maintenanceService.updateMaintenanceOperation(action.maintenanceList, action.maintenanceBannerList).pipe(
        switchMap((response: [Maintenance[], MaintenanceBanner[]] ) => [
        actions.UpdateMaintenanceOperationSuccess({ maintenanceList: response[0], maintenanceBannerList: response[1] }),
      ]),
      catchError((error: string) => of(actions.Error({ error }))),
    )),
  ));

  updateMaintenanceOperationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateMaintenanceOperationSuccess),
    tap(() => this.toaster.showSuccess('Maintenance was saved')),
  ), { dispatch: false });

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    filter(action => typeof action?.error === 'string'),
    tap(action => { this.toaster.showError(action.error); }),
  ), { dispatch: false });
}
