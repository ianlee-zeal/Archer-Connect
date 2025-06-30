import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { DeficiencySettingsService } from '@app/services/api/deficiency-settings.service';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ToastService } from '@app/services';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { Project } from '@app/models';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Page } from '@app/models/page';
import * as selectors from './selectors';
import * as actions from './actions';
import { DeficiencySettingsTemplatesState } from './reducers';
import { DeficiencySettingsTemplateService } from '../../services/deficiency-settings-template.service';
import { TemplateActionEnum } from '../../enums/template-actions.enum';

@Injectable()
export class DeficiencySettingsTemplatesEffects {
  constructor(
    private readonly store$: Store<DeficiencySettingsTemplatesState>,
    private readonly actions$: Actions,
    private readonly deficiencySettingsService: DeficiencySettingsService,
    private readonly router: Router,
    private readonly toaster: ToastService,
    private readonly templateService: DeficiencySettingsTemplateService,
  ) { }

  getDeficienciesTemplatesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDeficienciesTemplatesList),
    withLatestFrom(this.store$.select(projectSelectors.item)),
    mergeMap(([action, item]: [any, Project]) => this.deficiencySettingsService.searchProjectDeficienciesTemplates(item.id, action.params.request).pipe(
      switchMap((response: Page<DeficiencySettingsTemplate>) => [actions.GetDeficienciesTemplatesListSuccess({
        templates: response.items,
        agGridParams: action.params,
        totalRecords: response.totalRecordsCount,
      })]),
    )),
  ));

  getDeficienciesTemplatesListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDeficienciesTemplatesListSuccess),
    tap((action: any) => {
      action.agGridParams.success({ rowData: action.templates, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  refreshDeficiencySettingsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshDeficiencySettingsList),
    withLatestFrom(this.store$.select(selectors.gridParams)),
    tap(([, gridParams]: [any, IServerSideGetRowsParamsExtended]) => this.store$.dispatch(actions.GetDeficienciesTemplatesList({ params: gridParams }))),
  ), { dispatch: false });

  goToTemplateDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToTemplateDetails),
    withLatestFrom(this.store$.select(projectSelectors.item)),
    tap(([action, item]: [any, Project]) => {
      const url = ['projects', `${item.id}`, 'settings', 'tabs', 'deficiencies', 'details', 'action'];
      if (action.action) {
        url.push(`${action.action}`);
      }
      if (action.id) {
        url.push(`${action.id}`);
      }

      this.router.navigate(url);
    }),
  ), { dispatch: false });

  SetDefaultTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SetDefaultTemplate),
    withLatestFrom(this.store$.select(projectSelectors.item)),
    mergeMap(([action, item]: [any, Project]) => this.deficiencySettingsService.setDefaultTemplate(item.id, action.templateId).pipe(
      switchMap(() => [actions.SetDefaultTemplateSuccess()]),
      catchError((error: any) => of(actions.Error({ error }))),
    )),
  ));

  setDefaultTemplateSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SetDefaultTemplateSuccess),
    switchMap(() => [
      this.store$.dispatch(actions.RefreshDeficiencySettingsList()),
      this.toaster.showSuccess('Deficiency Template was changed'),
    ]),
  ), { dispatch: false });

  createTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateTemplate),
    withLatestFrom(
      this.store$.select(selectors.isOnlySystemDefaultExist),
      this.store$.select(selectors.systemDefaultTemplate),
    ),
    tap(([, isOnlySystemDefaultExist, systemDefaultTemplate]: [any, boolean, DeficiencySettingsTemplate]) => {
      if (isOnlySystemDefaultExist) {
        this.templateService.showModalProjectSettingRequired().subscribe((answer: boolean) => {
          if (answer) {
            this.store$.dispatch(actions.GoToTemplateDetails({ id: systemDefaultTemplate.id, action: TemplateActionEnum.New, canEdit: true }));
          }
        });
      } else {
        this.store$.dispatch(actions.GoToTemplateDetails({ id: systemDefaultTemplate.id, action: TemplateActionEnum.New, canEdit: true }));
      }
    }),
  ), { dispatch: false });
}
