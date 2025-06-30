import { filter, takeUntil } from 'rxjs/operators';
import { TaskRequest } from '@app/models/task-request';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { AppState } from '@app/state/index';
import { PermissionService, ServerErrorService, ToastService } from '@app/services';
import { UntypedFormGroup } from '@angular/forms';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { Subject } from 'rxjs';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { ActivatedRoute } from '@angular/router';
import { TaskDetailsTemplateComponent } from '@app/modules/shared/tasks/task-details-template/task-details-template.component';
import { TaskManagementEntityEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { Document } from '@app/models/documents';
import { TaskHelperService } from '@app/services/task/task.service';
import { TaskDocumentsSaveRequest } from '@app/models/task/task-documents-save-request';
import { ofType } from '@ngrx/effects';
import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';

@Component({
  selector: 'app-task-details-page',
  templateUrl: './task-details-page.component.html',
  styleUrls: ['./task-details-page.component.scss'],
  providers: [TaskHelperService],
})
export class TaskDetailsPageComponent extends Editable implements OnInit, OnDestroy {
  @ViewChild(TaskDetailsTemplateComponent) taskDetailsTemplateComponent: TaskDetailsTemplateComponent;
  public taskDetails: TaskRequest;
  public attachedDocuments: Document[] = [];
  public attachedDocumentsPristine: Document[];
  public canEdit = true;
  private isNewTask: boolean;
  public title = '';
  public archerId: number;

  readonly taskManagementEntityType = TaskManagementEntityEnum.Task;
  public taskDetails$ = this.store.select(selectors.taskDetails);
  public attachedDocuments$ = this.store.select(selectors.attachedDocuments);
  private ngUnsubscribe$ = new Subject<void>();

  private editPermission = PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Edit);
  private createPermission = PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Create);

  get hasChanges(): boolean {
    return (this.taskDetailsTemplateComponent && (this.taskDetailsTemplateComponent.form.dirty || !this.taskDetailsTemplateComponent.form.pristine))
      || (this.taskDetailsTemplateComponent?.attachedFilesComponent
      && this.taskDetailsTemplateComponent?.attachedFilesComponent.form.dirty);
  }

  protected get validationForm(): UntypedFormGroup {
    return this.taskDetailsTemplateComponent.form;
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
    },
    newSubTask: {
      callback: () => this.taskDetailsTemplateComponent.addNewSubtask(),
      disabled: () => this.canEdit,
      hidden: () => this.isNewTask,
      permissions: this.createPermission,
    },
  };

  constructor(
    private store: Store<AppState>,
    public serverErrorService: ServerErrorService,
    private readonly route: ActivatedRoute,
    private toaster: ToastService,
    private taskHelper: TaskHelperService,
    private readonly actionsSubj: ActionsSubject,
  ) { super(); }

  ngOnInit(): void {
    const taskId = this.route.snapshot.params.id;
    this.isNewTask = !taskId;
    this.canEdit = !taskId;

    this.title = taskId ? 'Task' : 'New Task';

    if (taskId) {
      this.taskDetails$
        .pipe(
          filter(task => !!task),
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe(task => {
          this.taskDetails = task;
          this.canEdit = false;
        });

      this.actionsSubj.pipe(
        takeUntil(this.ngUnsubscribe$),
        ofType(
          actions.CreateTaskComplete,
          actions.UpdateTaskComplete,
        ),
      ).subscribe(() => {
        this.taskDetailsTemplateComponent.form.markAsPristine();
        this.canEdit = false;
        this.isSavePerformed = true;
      });

      this.store.dispatch(actions.GetTaskDetails({ taskId }));

      this.attachedDocuments$
        .pipe(
          filter(task => !!task),
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe(attachedDocuments => {
          this.attachedDocumentsPristine = [...attachedDocuments];
          this.attachedDocuments = attachedDocuments;
        });
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onEdit() {
    super.edit();
    this.isSavePerformed = false;
  }

  public onSave() {
    if (!this.validate()
      || !this.taskDetailsTemplateComponent?.attachedFilesComponent?.validateForm()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }
    const taskDetails = this.taskDetailsTemplateComponent.form.getRawValue();

    let docsToSave: TaskDocumentsSaveRequest;
    const attachedDocsForm = this.taskDetailsTemplateComponent?.attachedFilesComponent?.form;
    if (attachedDocsForm?.dirty) {
      docsToSave = this.taskHelper.getDocumentsToSave(this.taskDetails?.id || 0, this.taskDetailsTemplateComponent.attachedDocuments, attachedDocsForm.getRawValue()?.documents);
    }

    super.save();
    if (this.taskDetails) {
      taskDetails.id = this.taskDetails.id;
      this.store.dispatch(actions.UpdateTask({ taskDetails, documents: docsToSave }));
    } else {
      this.store.dispatch(actions.CreateTask({ taskDetails, documents: docsToSave }));
    }
  }

  onBack() {
    this.store.dispatch(GotoParentView());
  }

  private onCancel(): void {
    if (!this.taskDetails) {
      this.store.dispatch(GotoParentView());
    }
    this.taskDetailsTemplateComponent.initForm(this.taskDetails);
    this.taskDetailsTemplateComponent.form.markAsPristine();
    if (!this.taskDetails) {
      this.store.dispatch(GotoParentView());
    }

    this.attachedDocuments = [...this.attachedDocumentsPristine];
    this.canEdit = false;
  }
}
