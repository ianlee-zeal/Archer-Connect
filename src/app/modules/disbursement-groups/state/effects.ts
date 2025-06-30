import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { mergeMap, catchError, switchMap, withLatestFrom, filter } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  ProjectsService,
  StagesService,
} from '@app/services';
import { EntityTypeEnum } from '@app/models/enums';
import { SelectHelper } from '@app/helpers/select.helper';
import { DisbursementGroupType } from '@app/models/disbursement-group-type';
import { Project } from '@app/models';
import { Store } from '@ngrx/store';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import * as actions from './actions';
import { DisbursementGroupsState } from './reducer';

@Injectable()
export class DisbursementGroupsEffects {
  constructor(
    private projectsService: ProjectsService,
    private actions$: Actions,
    private stageService: StagesService,
    private store$: Store<DisbursementGroupsState>,
  ) { }

  getDisbursementGroupTypes$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDisbursementGroupTypes),
    mergeMap(() => this.projectsService.getDisbursementGroupTypes()
      .pipe(
        switchMap((types: DisbursementGroupType[]) => ([actions.GetDisbursementGroupTypesSuccess({ types: SelectHelper.toOptions(types) })])),
        catchError((error: any) => of(actions.Error({ error }))),
      )),
  ));

  getDisbursementGroupStages$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDisbursementGroupStages),
    mergeMap(() => this.stageService.getByEntityTypeId(EntityTypeEnum.DisbursementGroups)
      .pipe(
        switchMap((stages: any) => ([actions.GetDisbursementGroupStagesSuccess({ stages: SelectHelper.toOptions(stages) })])),
        catchError((error: any) => of(actions.Error({ error }))),
      )),
  ));

  getDeficiencySettingsTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDeficiencySettingsTemplates),
    withLatestFrom(this.store$.select(projectSelectors.item)),
    filter(([, project]: [any, Project]) => !!project),
    mergeMap(([, project]: [any, Project]) => this.projectsService.getDeficiencySettingsTemplatesByProjectId(project.id)
      .pipe(
        switchMap((templates: DeficiencySettingsTemplate[]) => ([actions.GetDeficiencySettingsTemplatesSuccess({ templates })])),
        catchError((error: any) => of(actions.Error({ error }))),
      )),
  ));
}
