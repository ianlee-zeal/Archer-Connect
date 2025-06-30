import { OnDestroy, Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { takeUntil, filter } from 'rxjs/operators';

import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Project, User } from '@app/models';
import { PriorityEnum } from '@app/models/enums/priority.enum';
import { TaskManagementEntityEnum } from '@app/models/enums/task-management-entity.enum';
import { DragAndDropService, ModalService } from '@app/services';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state/index';
import { Subject } from 'rxjs';
import { sharedActions, sharedSelectors } from '@app/modules/shared/state';
import { CommonHelper, SearchOptionsHelper } from '@app/helpers';
import { TaskStatusEnum } from '@app/models/enums/task-status.enum';
import { TaskTemplate } from '@app/models/task-templates/task-template';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { EntityTypeEnum } from '@app/models/enums/entity-type.enum';
import { Document } from '@app/models/documents';
import * as taskActions from '@app/modules/task/state/actions';
import { ProjectSelectionModalComponent } from '../../entity-selection-modal/project-selection-modal.component';
import { UserSelectionModalComponent } from '../../entity-selection-modal/user-selection-modal.component';
import * as actions from '../../state/task-details-template/actions';
import { taskDetailsTemplateSelectors } from '../../state/task-details-template/selectors';
import { AddNewSubtaskModalComponent } from '../../add-new-subtask-modal/add-new-subtask-modal.component';
import { DragAndDropMultipleComponent } from '../../drag-and-drop-multiple/drag-and-drop-multiple.component';

@Component({
  selector: 'app-task-details-template',
  templateUrl: './task-details-template.component.html',
  styleUrls: ['./task-details-template.component.scss'],
})
export class TaskDetailsTemplateComponent implements OnInit, OnChanges, OnDestroy {
  @Input() record;
  @Input() attachedDocuments: Document[] = [];
  @Input() canEdit: boolean;
  @Input() title: string;
  @Input() labelWidth: number = 130;
  @Input() taskManagementEntity: TaskManagementEntityEnum;
  @Input() header: string;

  @ViewChild(DragAndDropMultipleComponent) attachedFilesComponent: DragAndDropMultipleComponent;

  private archerId: number;
  public templateOptions: SelectOption [];
  private templates: TaskTemplate [];
  private lienStages: SelectOption[];

  public archerId$ = this.store.select(taskDetailsTemplateSelectors.archerId);
  public categories$ = this.store.select(taskDetailsTemplateSelectors.taskCategories);
  public stages$ = this.store.select(taskDetailsTemplateSelectors.stages);
  public lienStages$ = this.store.select(sharedSelectors.dropDownsValuesSelectors.stages);
  public priorities$ = this.store.select(taskDetailsTemplateSelectors.priorities);
  public teams$ = this.store.select(taskDetailsTemplateSelectors.teams);
  public templates$ = this.store.select(taskDetailsTemplateSelectors.templates);
  private ngUnsubscribe$ = new Subject<void>();

  public allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);
  public allowedExtensions: string[] = [];

  public get isTemplateEntityType() {
    return this.taskManagementEntity === TaskManagementEntityEnum.Template;
  }

  public get isBlockingDate() {
    return this.form.get('blocked').value === true;
  }

  public get dueDateTooltip(): string {
    const standardSLA = this.form.controls.standardSLA.value;
    return standardSLA ? `The Standard SLA for this template is ${standardSLA} days` : '';
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    name: new UntypedFormControl(''),
    taskCategoryId: new UntypedFormControl('', Validators.required),
    assigneeUser: new UntypedFormControl(''),
    assigneeUserId: new UntypedFormControl(''),
    stageId: new UntypedFormControl(TaskStatusEnum.New),
    dueDate: new UntypedFormControl(null),
    createdFromTemplateId: new UntypedFormControl(''),
    associatedStageId: new UntypedFormControl(''),
    standardSLA: new UntypedFormControl(''),
    blocked: new UntypedFormControl(false),
    blockingDate: new UntypedFormControl(null),
    responsibleParty: new UntypedFormControl(''),
    taskPriorityId: new UntypedFormControl(PriorityEnum.Medium, Validators.required),
    project: new UntypedFormControl(''),
    projectId: new UntypedFormControl(''),
    teamId: new UntypedFormControl('', Validators.required),
    description: new UntypedFormControl(''),
    completedDate: new UntypedFormControl(null),
    resolutionSummary: new UntypedFormControl(''),
  });

  constructor(
    private modalService: ModalService,
    private store: Store<AppState>,
    private readonly dragAndDropService: DragAndDropService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    const { record } = this;
    const recordChanges = changes[CommonHelper.nameOf({ record })];
    if (record && recordChanges) {
      this.initForm(this.record);
      if (!this.isTemplateEntityType) {
        this.store.dispatch(taskActions.GetAllDocumentsByTaskId({ taskId: record.id }));
      }

      this.store.dispatch(actions.GetSubTaskCategories({ parentCategory: this.record.taskCategory }));
    }
  }

  ngOnInit(): void {
    this.archerId$.pipe(
      filter(id => !!id),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(id => {
      this.archerId = id;
    });

    this.templates$.pipe(
      filter(templates => !!templates),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(templates => {
      this.templates = templates;
      this.templateOptions = templates.map(value => ({ id: value.id, name: value.templateName }));
    });

    this.lienStages$.pipe(
      filter(lienStages => !!lienStages),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(lienStages => {
      this.lienStages = lienStages;
    });

    if (!this.isTemplateEntityType) {
      this.form.get('name').setValidators(Validators.required);
      this.form.get('dueDate').setValidators(Validators.required);
    } else {
      this.form.get('standardSLA').setValidators(Validators.required);
    }

    this.setValidators();
    this.loadExtensions();

    this.subscribeToBlockedValueChangers();
    this.subscribeToCreatedFromTemplateIdValueChangers();
    this.form.get('stageId').valueChanges.subscribe(this.handleStageIdChanges);

    this.store.dispatch(actions.GetTaskCategories());
    this.store.dispatch(actions.GetPriorities());
    this.store.dispatch(actions.GetStages());
    this.store.dispatch(sharedActions.dropDownsValuesActions.GetStages({ entityTypeId: EntityTypeEnum.LienProducts }));
    this.store.dispatch(actions.GetTeams());
    this.store.dispatch(actions.GetTemplates());
    this.store.dispatch(actions.GetArcherOrgId());
  }

  public initForm(item) {
    this.form.patchValue({
      name: item?.name,
      taskCategoryId: item?.taskCategory?.id,
      assigneeUser: item?.assigneeUser?.displayName,
      assigneeUserId: item?.assigneeUser?.id,
      stageId: item?.stage?.id,
      dueDate: item?.dueDate,
      createdFromTemplateId: item?.createdFromTemplate?.id,
      associatedStageId: item?.associatedStageId,
      standardSLA: item?.standardSLA,
      blocked: item?.blocked,
      blockingDate: item?.blockingDate,
      responsibleParty: item?.responsibleParty,
      taskId: item?.team?.id,
      taskPriorityId: item?.taskPriority?.id,
      project: item?.project?.name,
      projectId: item?.project?.id,
      teamId: item?.team?.id,
      description: item?.description,
      completedDate: item?.completedDate,
      resolutionSummary: item?.resolutionSummary,
    }, { emitEvent: false });
    this.store.dispatch(actions.SaveSelectedTemplateId({ templateId: item?.createdFromTemplate?.id }));
    this.handleStageIdChanges(item?.stage?.id);
  }

  private setValidators() {
    if (!this.isTemplateEntityType) {
      this.form.controls.project.addValidators(Validators.required);
      this.form.controls.project.updateValueAndValidity();
    }
  }

  getLienStageName(lienStageId: number) {
    return this.lienStages?.find(lienStage => lienStage.id === lienStageId)?.name;
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

  private subscribeToBlockedValueChangers() {
    this.form.controls.blocked.valueChanges.subscribe(value => {
      const validator = value ? Validators.required : null;

      if (!value) {
        this.form.patchValue({ blockingDate: null, responsibleParty: null });
      }

      this.form.controls.responsibleParty.setValidators(validator);
      this.form.controls.responsibleParty.updateValueAndValidity();
    });
  }

  private subscribeToCreatedFromTemplateIdValueChangers() {
    this.form.controls.createdFromTemplateId.valueChanges.subscribe(templateId => {
      if (!templateId) {
        return;
      }
      const template = this.templates.find(value => value.id === templateId);

      this.form.patchValue({
        name: template?.name,
        taskCategoryId: template?.taskCategory?.id,
        assigneeUser: template?.assigneeUser?.displayName,
        assigneeUserId: template?.assigneeUser?.id,
        dueDate: CommonHelper.addDays(new Date(), template?.standardSLA),
        standardSLA: template?.standardSLA,
        taskPriorityId: template?.taskPriority?.id,
        teamId: template?.team?.id,
        description: template?.description,
      });

      this.store.dispatch(actions.GetSubTemplateList({
        entityId: templateId,
        gridParams: { request: { ...SearchOptionsHelper.getFilterRequest([]) } } as IServerSideGetRowsParamsExtended,
        existing: false,
      }));

      this.store.dispatch(actions.SaveSelectedTemplateId({ templateId }));
    });
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

  public openProjectModal(): void {
    this.modalService.show(ProjectSelectionModalComponent, {
      initialState: { onEntitySelected: (project: Project) => this.onValueSelected(project.id, project.name, 'project') },
      class: 'entity-selection-modal',
    });
  }

  public openAssigneeModal(): void {
    this.modalService.show(UserSelectionModalComponent, {
      initialState: {
        onEntitySelected: (user: User) => this.onValueSelected(user.id, user.displayName, 'assigneeUser'),
        orgId: this.archerId,
      },
      class: 'user-selection-modal',
    });
  }

  public addNewSubtask(): void {
    this.modalService.show(AddNewSubtaskModalComponent, {
      class: 'add-new-subtask-modal',
      initialState: {
        parentId: this.record?.id,
        parentCategoryId: this.record.taskCategory?.id,
        parentCategory: this.record?.taskCategory,
        taskManagementEntity: this.taskManagementEntity,
        standardSLA: this.record.standardSLA,
        templateName: this.record?.templateName,
      },
    });
  }

  private onValueSelected(id: number, name: string, controlName: string) {
    this.form.patchValue({ [controlName]: name, [`${controlName}Id`]: id });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  public onClear(controlName: string): void {
    this.form.patchValue({ [controlName]: null, [`${controlName}Id`]: null });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.SaveSelectedTemplateId({ templateId: 0 }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
