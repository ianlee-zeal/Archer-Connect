import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AppState } from '@app/modules/admin/user-access-policies/state/state';
import { ActionsSubject, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalService, ToastService } from '@app/services';
import { ofType } from '@ngrx/effects';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { User } from '@app/models/user';
import { PriorityEnum } from '@app/models/enums/priority.enum';
import { TaskStatusEnum } from '@app/models/enums/task-status.enum';
import { taskDetailsTemplateSelectors } from '@app/modules/shared/state/task-details-template/selectors';
import * as taskDetailsTemplateActions from '@app/modules/shared/state/task-details-template/actions';
import { TaskManagementEntityEnum } from '@app/models/enums/task-management-entity.enum';
import { TaskRequest } from '@app/models/task-request';
import { TaskTemplate } from '@app/models/task-templates/task-template';
import { sharedActions, sharedSelectors } from '@app/modules/shared/state';
import { CommonHelper } from '@app/helpers';
import { Document } from '@app/models/documents';
import { TaskHelperService } from '@app/services/task/task.service';
import { TaskDocumentsSaveRequest } from '@app/models/task/task-documents-save-request';
import { ValidationForm } from '../_abstractions/validation-form';
import { UserSelectionModalComponent } from '../entity-selection-modal/user-selection-modal.component';
import { SelectOption } from '../_abstractions/base-select';
import { DragAndDropMultipleComponent } from '../drag-and-drop-multiple/drag-and-drop-multiple.component';

@Component({
  selector: 'app-add-new-subtask-modal',
  templateUrl: './add-new-subtask-modal.component.html',
  styleUrls: ['./add-new-subtask-modal.component.scss'],
  providers: [TaskHelperService],
})
export class AddNewSubtaskModalComponent extends ValidationForm implements OnInit, OnDestroy {
  public parentId: number;
  public standardSLA: number;
  public parentCategory: SelectOption;
  public parentCategoryId: number;
  public categories: SelectOption[] = [];
  public archerId: number;
  public taskManagementEntity: TaskManagementEntityEnum;
  public title = '';
  public recordId: number;
  public record: any;
  public allowedExtensions: string[] = [];
  public attachedDocuments: Document[] = [];
  public attachedDocsInProgress: boolean = false;
  public templateName: string;

  public categories$ = this.store.select(taskDetailsTemplateSelectors.subTaskCategories);
  public priorities$ = this.store.select(taskDetailsTemplateSelectors.priorities);
  public stages$ = this.store.select(taskDetailsTemplateSelectors.stages);
  public archerId$ = this.store.select(taskDetailsTemplateSelectors.archerId);
  public subTaskDetails$ = this.store.select(taskDetailsTemplateSelectors.subTaskDetails);
  public subTemplateDetails$ = this.store.select(taskDetailsTemplateSelectors.subTemplateDetails);
  public subDetails$: Observable<any>;
  public allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);
  public attachedDocuments$ = this.store.select(taskDetailsTemplateSelectors.attachedDocuments);
  public attachedDocsInProgress$ = this.store.select(taskDetailsTemplateSelectors.attachedDocumentsInProgress);

  private ngUnsubscribe$ = new Subject<void>();

  @ViewChild(DragAndDropMultipleComponent) attachedFilesComponent: DragAndDropMultipleComponent;

  public get dueDateTooltip(): string {
    return this.standardSLA ? `The Standard SLA for this template is ${this.standardSLA} days` : '';
  }

  public get isTaskManagementEntity(): boolean {
    return this.taskManagementEntity === TaskManagementEntityEnum.Task;
  }

  public readonly awaitedSaveActionTypes = [
    taskDetailsTemplateActions.CreateSubTaskComplete.type,
    taskDetailsTemplateActions.UpdateSubTaskComplete.type,
    taskDetailsTemplateActions.Error,
  ];

  constructor(
    private store: Store<AppState>,
    private modalWindow: BsModalRef,
    private toaster: ToastService,
    private modalService: ModalService,
    private readonly actionsSubj: ActionsSubject,
    private taskHelper: TaskHelperService,
  ) { super(); }

  ngOnInit(): void {
    this.title = this.recordId ? 'Manage Sub-Task' : 'Create Sub-Task';

    if (this.recordId) {
      this.subDetails$ = this.taskManagementEntity === TaskManagementEntityEnum.Task
        ? this.subTaskDetails$
        : this.subTemplateDetails$;

      this.subDetails$
        .pipe(
          filter(task => !!task),
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe(task => {
          this.record = task;
          this.initForm(this.record);
        });

      if (this.taskManagementEntity === TaskManagementEntityEnum.Task) {
        this.store.dispatch(taskDetailsTemplateActions.GetSubTask({ taskId: this.recordId }));

        this.attachedDocuments$
          .pipe(
            filter(task => !!task),
            takeUntil(this.ngUnsubscribe$),
          )
          .subscribe(attachedDocuments => {
            this.attachedDocuments = attachedDocuments;
          });
        this.attachedDocsInProgress$.pipe(takeUntil(this.ngUnsubscribe$))
          .subscribe(inProgress => {
            this.attachedDocsInProgress = inProgress;
          });

        this.store.dispatch(taskDetailsTemplateActions.GetDocumentsBySubTaskId({ subTaskId: this.recordId }));
      } else {
        this.store.dispatch(taskDetailsTemplateActions.GetSubTemplate({ templateId: this.recordId }));
      }
    }

    this.store.dispatch(taskDetailsTemplateActions.GetPriorities());
    this.store.dispatch(taskDetailsTemplateActions.GetStages());
    this.loadExtensions();

    this.actionsSubj.pipe(
      ofType(taskDetailsTemplateActions.CreateSubTaskComplete),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.cancel();
      this.toaster.showSuccess('Sub-Task successfully created');
    });

    this.actionsSubj.pipe(
      ofType(taskDetailsTemplateActions.UpdateSubTaskComplete),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.cancel();
      this.toaster.showSuccess('Sub-Task successfully updated');
    });

    this.archerId$.pipe(
      filter(id => !!id),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(id => {
      this.archerId = id;
    });

    this.categories$.pipe(
      filter(items => !!items),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(categories => {
      this.categories = [...categories];
      if (this.record) {
        const found = this.categories.find(c => c.id === this.record.taskCategoryId);
        if (!found) {
          this.categories.push(this.record.taskCategory);
        }
      }
      if (categories.length === 1) {
        this.form.controls.taskCategoryId.patchValue(categories[0].id);
        this.form.updateValueAndValidity();
      }
    });

    this.form.get('dueDate').setValue(CommonHelper.addDays(new Date(), this.standardSLA));
    this.form.get('stageId').valueChanges.subscribe(this.handleStageIdChanges);
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    name: new UntypedFormControl('', Validators.required),
    taskCategoryId: new UntypedFormControl(null, Validators.required),
    dueDate: new UntypedFormControl(null, Validators.required),
    assigneeUser: new UntypedFormControl(''),
    assigneeUserId: new UntypedFormControl(''),
    stageId: new UntypedFormControl(TaskStatusEnum.New, null),
    taskPriorityId: new UntypedFormControl(PriorityEnum.Medium, Validators.required),
    description: new UntypedFormControl(''),
    completedDate: new UntypedFormControl(null),
    resolutionSummary: new UntypedFormControl(''),
  });

  public onOpenModal(): void {
    this.modalService.show(UserSelectionModalComponent, {
      initialState: {
        onEntitySelected: (user: User) => this.onValueSelected(user.id, user.displayName, 'assigneeUser'),
        orgId: this.archerId,
      },
      class: 'user-selection-modal',
    });
  }

  private onValueSelected(id: number, name: string, controlName: string) {
    this.form.patchValue({ [controlName]: name, [`${controlName}Id`]: id });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  private loadExtensions(): void {
    this.store.dispatch(sharedActions.commonActions.GetMimeTypes());

    this.allowedExtensions$
      .pipe(
        filter(x => !!x),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(extensions => { this.allowedExtensions = extensions; });
  }

  public onClear(controlName: string): void {
    this.form.patchValue({ [controlName]: null, [`${controlName}Id`]: null });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  public onSave() {
    if (!this.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }
    const taskDetails = this.form.getRawValue();
    taskDetails.parentId = this.parentId;
    taskDetails.templateName = this.templateName;

    let docsToSave: TaskDocumentsSaveRequest;
    if (this.taskManagementEntity === TaskManagementEntityEnum.Task) {
      const attachedDocsForm = this.attachedFilesComponent?.form;
      if (attachedDocsForm?.dirty) {
        docsToSave = this.taskHelper.getDocumentsToSave(this.recordId, this.attachedDocuments, attachedDocsForm.getRawValue()?.documents);
      }
    }

    if (this.record) {
      let taskDetailsToSave: any;
      const updatedRecord = {
        ...this.record,
        ...taskDetails,
        taskCategory: { id: taskDetails.taskCategoryId, name: '' },
        stage: { id: taskDetails.stageId, name: '' },
        taskPriority: { id: taskDetails.taskPriorityId, name: '' },
        assigneeUser: { id: taskDetails.assigneeUserId, name: taskDetails.assigneeUser?.name },
        parent: { id: this.parentId, name: taskDetails.parent?.name },
      };
      if (this.taskManagementEntity === TaskManagementEntityEnum.Task) {
        taskDetailsToSave = TaskRequest.toDtoSubTask(updatedRecord);
      } else {
        taskDetailsToSave = TaskTemplate.toDtoSubTask(updatedRecord);
      }

      this.store.dispatch(taskDetailsTemplateActions.UpdateSubTask({ taskDetails: taskDetailsToSave, taskManagementEntity: this.taskManagementEntity, documents: docsToSave }));
    } else {
      this.store.dispatch(taskDetailsTemplateActions.CreateSubTask({ taskDetails, taskManagementEntity: this.taskManagementEntity, documents: docsToSave }));
    }
  }

  public initForm(item) {
    this.form.patchValue({
      name: item?.name,
      taskCategoryId: item?.taskCategory?.id,
      dueDate: item?.dueDate,
      assigneeUser: item?.assigneeUser?.displayName,
      assigneeUserId: item?.assigneeUser?.id,
      stageId: item?.stage?.id,
      taskPriorityId: item?.taskPriority?.id,
      completedDate: item?.completedDate,
      resolutionSummary: item?.resolutionSummary,
      description: item?.description,
    }, { emitEvent: false });

    this.handleStageIdChanges(item?.stage?.id)
  }

  public get hasChanges() {
    return this.form.dirty || this.attachedFilesComponent?.form.dirty;
  }

  public get isInvalid() {
    return this.form.invalid
      || (this.attachedFilesComponent && !this.attachedFilesComponent.validateForm());
  }

  public cancel() {
    this.modalWindow.hide();
  }

  private handleStageIdChanges = value => {
    if (value === TaskStatusEnum.Completed) {
      this.form.get('completedDate').enable();
      this.form.get('completedDate').setValue(new Date());
    } else {
      this.form.get('completedDate').disable();
      this.form.get('completedDate').setValue(null);
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(taskDetailsTemplateActions.ClearSubTaskForm());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
