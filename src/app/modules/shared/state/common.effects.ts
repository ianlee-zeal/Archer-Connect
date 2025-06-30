import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { mergeMap, map, catchError, tap, switchMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ModalService } from '@app/services/modal.service';
import { Router } from '@angular/router';
import { DefaultGlobalSearchTypeHelper } from '@app/helpers/default-global-search-type.helper';
import { DefaultGlobalSearchType, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as services from '../../../services';
import * as sharedActions from './common.actions';

import { TaskModalComponent } from '../task-modal/task-modal.component';
import { MimeType } from '../../../models/mime-type';
import { BackNavService, PermissionService } from '../../../services';
import { ROUTE_HOME } from '@app/app-routing.module';

@Injectable()
export class SharedEffects {
  private task_modal: BsModalRef;

  constructor(
    private formsService: services.FormsService,
    private backNavService: BackNavService,
    private mimeTypesService: services.MimeTypesService,
    private userService: services.UsersService,
    private actions$: Actions,
    private modalService: ModalService,
    private router: Router,
    private permissionService: PermissionService,
  ) { }

  getForms$ = createEffect(() => this.actions$.pipe(
    ofType(sharedActions.GetForms),
    mergeMap(action => this.formsService.index(action.search).pipe(
      map(formsIndex => sharedActions.GetFormsComplete({ formsIndex })),
      catchError(error => of(sharedActions.Error({ error }))),
    )),
  ));

  openTask$ = createEffect(() => this.actions$.pipe(
    ofType(sharedActions.OpenTask),
    tap(() => {
      this.task_modal = this.modalService.show(TaskModalComponent, {});
    }),
  ), { dispatch: false });

  getMimeTypesList$ = createEffect(() => this.actions$.pipe(
    ofType(sharedActions.GetMimeTypes),
    mergeMap(() => this.mimeTypesService.getMimeTypesList().pipe(
      switchMap(response => {
        const mimeTypes = response.map(item => MimeType.toModel(item));
        const allowedFileExtensions = mimeTypes.map(mimeType => `.${mimeType.extension}`);

        return [
          sharedActions.GetMimeTypesComplete({ mimeTypes, allowedFileExtensions }),
        ];
      }),
      catchError(error => of(sharedActions.Error({ error }))),
    )),
  ));

  gotoParentView$ = createEffect(() => this.actions$.pipe(
    ofType(sharedActions.GotoParentView),
    tap(({ alterRoute }) => {
      const prevRoute = this.backNavService.pop();

      prevRoute
        ? this.router.navigate([prevRoute.url], prevRoute.extras)
        : this.router.navigate([alterRoute]);
    }),
  ), { dispatch: false });

  gotoDefaultView$ = createEffect(() => this.actions$.pipe(
    ofType(sharedActions.GotoDefaultView),
    mergeMap(({ userId }) => this.userService.get(userId).pipe(
      tap(user => {
        let defaultSearchUrl = '.';

        if (user) {
          defaultSearchUrl = DefaultGlobalSearchTypeHelper.defaultGlobalSearchToRoute(
            DefaultGlobalSearchType[user.defaultGlobalSearchType.name],
          );
          if (this.permissionService.has(PermissionService.create(PermissionTypeEnum.FirmLandingPage, PermissionActionTypeEnum.Read))
            && !user.defaultOrganization?.isMaster) {
            defaultSearchUrl = ROUTE_HOME;
          }
        }

        this.router.navigate([defaultSearchUrl]);
      }),
      catchError(error => of(sharedActions.Error({ error }))),
    )),
  ), { dispatch: false });
}
