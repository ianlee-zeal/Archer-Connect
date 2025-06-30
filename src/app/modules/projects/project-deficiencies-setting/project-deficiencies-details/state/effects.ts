import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { ToastService } from '@app/services';
import { catchError, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { DeficiencySettingsService } from '@app/services/api/deficiency-settings.service';
import { of } from 'rxjs';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import { IdActivePair } from '@app/models/id-active';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { DeficiencySettingsConfig } from '@app/models/deficiencies/deficiency-settings-config';
import { Project } from '@app/models';
import { IDeficiencySettingsTemplateUpdate } from '@app/models/deficiencies/deficiency-settings-template-update';
import { IDictionary } from '@app/models/utils/dictionary';
import * as selectors from './selectors';
import * as listActions from '../../project-deficiencies-grid/state/actions';
import * as actions from './actions';
import { DeficienciesTemplateDetailsState } from './reducers';
import { TemplateActionEnum } from '../../enums/template-actions.enum';
import { DeficiencySettingsTemplateService } from '../../services/deficiency-settings-template.service';

@Injectable()
export class DeficienciesTemplateDetailsEffects {
  constructor(
    private readonly store$: Store<DeficienciesTemplateDetailsState>,
    private readonly actions$: Actions,
    private readonly toaster: ToastService,
    private readonly deficiencySettingsService: DeficiencySettingsService,
    private readonly deficiencySettingsTemplateService: DeficiencySettingsTemplateService,
  ) { }

  getDeficiencySettingsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDeficiencySettingsTemplate),
    withLatestFrom(this.store$.select(projectSelectors.item)),
    mergeMap(([action, project] : [any, Project]) => this.deficiencySettingsService.getDeficiencyTemplate(action.templateId, project.id)
      .pipe(
        switchMap((response: DeficiencySettingsTemplate) => [
          actions.GetDeficiencySettingsTemplateSuccess({ template: DeficiencySettingsTemplate.toModel(response) }),
        ]),
        catchError((error: any) => of(actions.Error({ error }))),
      )),
  ));

  getDeficiencySettingsTemplateSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDeficiencySettingsTemplateSuccess),
    tap(() => {
      switch (this.deficiencySettingsTemplateService.actionOnPage) {
        case TemplateActionEnum.Copy:
        case TemplateActionEnum.New:
        case TemplateActionEnum.Edit:
          this.store$.dispatch(actions.SetEditFlag({ canEdit: true }));
          break;
        default:
          this.store$.dispatch(actions.SetEditFlag({ canEdit: false }));
      }
    }),
  ), { dispatch: false });

  saveDeficiencySettings$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveDeficiencySettings),
    withLatestFrom(
      this.store$.select(projectSelectors.item),
      this.store$.select(selectors.updateData),
      this.store$.select(selectors.updatedSettingItems),
    ),
    mergeMap(([, projectItem, updateData, updatedSettingItems] : [any, Project, IDeficiencySettingsTemplateUpdate, IDictionary<number, DeficiencySettingsConfig>]) => {
      // eslint-disable-next-line no-param-reassign
      updateData.settingItems = updatedSettingItems.values().map((i: DeficiencySettingsConfig) => new IdActivePair(i.id, i.active));
      return this.deficiencySettingsTemplateService.chooseSendingMethod({ ...updateData, projectId: projectItem.id })
        .pipe(
          switchMap((data: DeficiencySettingsTemplate) => ([
            actions.SaveDeficiencySettingsSuccess({ templateId: data.id }),
          ])),
          catchError((error: any) => of(actions.Error({ error }))),
        );
    }),
  ));

  saveDeficiencySettingsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveDeficiencySettingsSuccess),
    tap((action: any) => {
      this.toaster.showSuccess('Deficiency Settings saved successfully');
      if (this.deficiencySettingsTemplateService.actionOnPage !== TemplateActionEnum.New) {
        this.store$.dispatch(actions.GetDeficiencySettingsTemplate({ templateId: action.templateId }));
      }
      this.store$.dispatch(listActions.GoToTemplateDetails({ id: action.templateId, action: TemplateActionEnum.Read, canEdit: false }));
    }),
  ), { dispatch: false });

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap(({ error }: { error: string }) => [this.toaster.showError(error)]),
  ), { dispatch: false });
}
