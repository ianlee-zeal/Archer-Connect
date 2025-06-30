import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as projectActions from '@app/modules/projects/state/actions';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonHelper } from '@app/helpers';
import { ActivatedRoute } from '@angular/router';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { Project } from '@app/models';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { ProjectDeficienciesTemplateFormComponent } from '../deficiencies-settings-form/deficiencies-settings-form.component';
import { TemplateActionEnum } from '../../enums/template-actions.enum';
import { ProjectDeficienciesSettingsListComponent } from '../deficiencies-settings-list/deficiencies-settings-list.component';
import { selectors, actions } from '../state';
import { DeficienciesTemplateDetailsState } from '../state/reducers';
import { DeficiencySettingsTemplateService } from '../../services/deficiency-settings-template.service';

@Component({
  selector: 'app-project-deficiencies-details',
  templateUrl: './project-deficiencies-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDeficienciesTemplateDetailsComponent implements OnInit, OnDestroy {
  @ViewChild(ProjectDeficienciesTemplateFormComponent) formComponent: ProjectDeficienciesTemplateFormComponent;
  @ViewChild(ProjectDeficienciesSettingsListComponent) listComponent: ProjectDeficienciesSettingsListComponent;

  readonly project$ = this.store.select(projectSelectors.item);
  private readonly deficiencySettingsSavedSuccessfully$ = this.store.select(selectors.deficiencySettingsSavedSuccessfully);
  private readonly canEdit$ = this.store.select(selectors.canEdit);
  private readonly deficiencyTemplate$ = this.store.select(selectors.deficiencyTemplate);
  protected ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store<DeficienciesTemplateDetailsState>,
    private readonly activatedRoute: ActivatedRoute,
    private readonly deficiencySettingsTemplateService: DeficiencySettingsTemplateService,
  ) {

  }
  public canEdit: boolean;
  private deficiencyTemplate: DeficiencySettingsTemplate;
  private project: Project;

  private readonly actionBar: ActionHandlersMap = {
    edit: {
      callback: () => this.startEditing(),
      hidden: () => this.canEdit,
      permissions: PermissionService.create(
        PermissionTypeEnum.ProjectQsfDeficiencies,
        PermissionActionTypeEnum.DeficiencyConfiguration,
      ),
    },
    save: {
      callback: () => this.onSave(),
      hidden: () => !this.canEdit,
      disabled: () => this.formComponent?.form.invalid,
      awaitedActionTypes: [
        actions.SaveDeficiencySettingsSuccess.type,
        actions.Error.type,
      ],
    },
    cancel: {
      callback: () => this.stopEditing(true),
      hidden: () => !this.canEdit,
    },
    back: () => this.back(),
  };

  ngOnInit(): void {
    this.deficiencySettingsTemplateService.initRouting(this.activatedRoute.snapshot);

    this.project$
      .pipe(
        filter((item: Project) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((project: Project) => {
        this.project = project;
        this.store.dispatch(actions.GetDeficiencySettingsTemplate({ templateId: this.deficiencySettingsTemplateService.templateId }));
      });

    this.store.dispatch(
      projectActions.UpdateActionBar({ actionBar: this.actionBar }),
    );

    this.deficiencySettingsSavedSuccessfully$.pipe(
      filter((deficiencySettingsSavedSuccessfully: boolean) => !!deficiencySettingsSavedSuccessfully),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => this.stopEditing());

    this.canEdit$.pipe(
      filter((canEdit: boolean) => !CommonHelper.isNullOrUndefined(canEdit)),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((canEdit: boolean) => {
      this.canEdit = canEdit;
    });

    this.deficiencyTemplate$.pipe(
      filter((i: DeficiencySettingsTemplate) => !CommonHelper.isNullOrUndefined(i)),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((deficiencyTemplate: DeficiencySettingsTemplate) => {
      this.deficiencyTemplate = deficiencyTemplate;
    });
  }

  private startEditing(): void {
    this.store.dispatch(actions.SetEditFlag({ canEdit: true }));
    this.listComponent.startEditing();
  }

  public onSave(): void {
    if (this.deficiencyTemplate.isSystemDefault) {
      this.deficiencySettingsTemplateService.actionOnPage = TemplateActionEnum.Copy;
    }
    this.store.dispatch(actions.SaveDeficiencySettings({ templateId: this.deficiencySettingsTemplateService.templateId }));
  }

  private stopEditing(withReload = false): void {
    switch (this.deficiencySettingsTemplateService.actionOnPage) {
      case TemplateActionEnum.New:
        this.back();
        break;
      default:
        this.deficiencySettingsTemplateService.actionOnPage = TemplateActionEnum.Read;
        this.listComponent.stopEditing();
        if (withReload) {
          this.store.dispatch(actions.GetDeficiencySettingsTemplate({ templateId: this.deficiencySettingsTemplateService.templateId }));
        }
        break;
    }
  }

  private back(): void {
    this.store.dispatch(GotoParentView(`projects/${this.project.id}/settings/tabs/deficiencies`));
  }

  ngOnDestroy(): void {
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
    this.store.dispatch(actions.ResetTemplateData());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
