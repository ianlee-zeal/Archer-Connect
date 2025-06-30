import { TaskTemplate } from '@app/models/task-templates/task-template';
import { filter, takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { AppState } from '@app/state/index';
import { PermissionService, ServerErrorService, ToastService } from '@app/services';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { Subject } from 'rxjs';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { ActivatedRoute } from '@angular/router';
import { TaskManagementEntityEnum } from '@app/models/enums/task-management-entity.enum';
import { TemplateStatusEnum } from '@app/models/enums/template-status.enum';
import { TaskDetailsTemplateComponent } from '@app/modules/shared/tasks/task-details-template/task-details-template.component';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { ofType } from '@ngrx/effects';

@Component({
  selector: 'app-template-details-page',
  templateUrl: './template-details-page.component.html',
  styleUrls: ['./template-details-page.component.scss'],
})
export class TemplateDetailsPageComponent extends Editable implements OnInit, OnDestroy {
  @ViewChild(TaskDetailsTemplateComponent) taskDetailsTemplateComponent: TaskDetailsTemplateComponent;

  public templateDetails: TaskTemplate;
  public canEdit = true;
  private isNewTask: boolean;
  public title = '';
  public labelWidth = 180;
  public taskManagementEntityEnum: TaskManagementEntityEnum = TaskManagementEntityEnum.Template;

  public statuses = [
    { id: TemplateStatusEnum.Active, name: TemplateStatusEnum[TemplateStatusEnum.Active] },
    { id: TemplateStatusEnum.Inactive, name: TemplateStatusEnum[TemplateStatusEnum.Inactive] },
  ];

  private editPermission = PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Edit);
  private createPermission = PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Create);

  public templateDetails$ = this.store.select(selectors.templateDetails);
  private ngUnsubscribe$ = new Subject<void>();

  get hasChanges(): boolean {
    return (this.form.dirty || !this.form.pristine)
    || (this.taskDetailsTemplateComponent?.form.dirty || !this.taskDetailsTemplateComponent?.form.pristine);
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form && this.taskDetailsTemplateComponent.form;
  }

  public actionBarActionHandlers: ActionHandlersMap = {
    save: {
      callback: () => this.onSave(),
      hidden: () => !this.canEdit,
      disabled: () => this.canLeave,
    },
    edit: {
      callback: () => this.onEdit(),
      hidden: () => this.canEdit || this.isNewTask,
      permissions: this.editPermission,
    },
    back: {
      callback: () => this.onBack(),
      disabled: () => !this.canLeave,
    },
    cancel: {
      callback: () => this.onCancel(),
      hidden: () => !this.canEdit,
      disabled: () => this.canLeave,
    },
    newSubTask: {
      callback: () => this.taskDetailsTemplateComponent.addNewSubtask(),
      disabled: () => this.canEdit,
      hidden: () => this.isNewTask,
      permissions: this.createPermission,
    },
  };

  public form: UntypedFormGroup = new UntypedFormGroup({
    templateName: new UntypedFormControl('', Validators.required),
    active: new UntypedFormControl(TemplateStatusEnum.Active),
    templateDescription: new UntypedFormControl(''),
  });

  constructor(
    private store: Store<AppState>,
    public serverErrorService: ServerErrorService,
    private readonly route: ActivatedRoute,
    private toaster: ToastService,
    private readonly actionsSubj: ActionsSubject,
  ) { super(); }

  ngOnInit(): void {
    const taskId = this.route.snapshot.params.id;
    this.isNewTask = !taskId;
    this.canEdit = !taskId;

    this.title = taskId ? 'Task Template' : 'New Task Template';

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.UpdateTemplateComplete,
        actions.CreateTemplateComplete,
      ),
    ).subscribe(() => {
      this.taskDetailsTemplateComponent.form.markAsPristine();
      this.form.markAsPristine();
      this.canEdit = false;
      this.isSavePerformed = true;
    });

    if (taskId) {
      this.templateDetails$
        .pipe(
          filter(template => !!template),
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe(template => {
          this.templateDetails = template;
          this.canEdit = false;
        });

      this.store.dispatch(actions.GetTemplateDetails({ taskId }));
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onEdit() {
    super.edit();
    this.isSavePerformed = false;
    this.initForm();
  }

  private initForm() {
    this.form.patchValue({
      templateName: this.templateDetails?.templateName,
      active: Number(this.templateDetails?.active),
      templateDescription: this.templateDetails?.templateDescription,
    });
  }

  public onSave() {
    if (!this.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }
    super.save();
    const templateDetails = {
      ...this.form.getRawValue(),
      ...this.taskDetailsTemplateComponent.form.getRawValue(),
      taskTeamId: this.taskDetailsTemplateComponent.form.controls.teamId.value,
    };

    if (this.templateDetails) {
      templateDetails.id = this.templateDetails.id;
      this.store.dispatch(actions.UpdateTemplate({ templateDetails }));
    } else {
      this.store.dispatch(actions.CreateTemplate({ templateDetails }));
    }
  }

  onBack() {
    this.store.dispatch(GotoParentView());
  }

  private onCancel(): void {
    if (this.templateDetails) {
      this.canEdit = false;
    }
    this.initForm();
    this.taskDetailsTemplateComponent.initForm(this.templateDetails);
    this.form.markAsPristine();
    this.taskDetailsTemplateComponent.form.markAsPristine();
  }
}
