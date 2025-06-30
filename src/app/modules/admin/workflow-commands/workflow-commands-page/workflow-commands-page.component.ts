import { filter, takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { AppState } from '@app/state/index';
import { MessageService, PermissionService, ServerErrorService, ToastService } from '@app/services';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { Subject } from 'rxjs';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { ofType } from '@ngrx/effects';
import { WorkflowCommand } from '@app/models/workflow-command';
import { WorkflowCommandFilterTypesEnum } from '@app/models/enums/workflow-command-filter-types.enum';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { ClearWorkflowCommandDetails } from '../state/actions';

@Component({
  selector: 'app-workflow-commands-page',
  templateUrl: './workflow-commands-page.component.html',
  styleUrls: ['./workflow-commands-page.component.scss'],
})
export class WorkflowCommandsPageComponent extends Editable implements OnInit, OnDestroy {
  public workflowCommandDetails: WorkflowCommand;
  public canEdit = true;
  private isNewTask: boolean;
  public title = '';
  public labelWidth = 180;

  public readonly beginStages$ = this.store.select(selectors.workflowCommandFilters, { filterType: WorkflowCommandFilterTypesEnum.BeginStatus });
  public readonly endStages$ = this.store.select(selectors.workflowCommandFilters, { filterType: WorkflowCommandFilterTypesEnum.EndStatus });
  public readonly paymentTypes$ = this.store.select(selectors.workflowCommandFilters, { filterType: WorkflowCommandFilterTypesEnum.PaymentType });

  private editPermission = PermissionService.create(PermissionTypeEnum.WorkflowCommands, PermissionActionTypeEnum.Edit);
  private deletePermission = PermissionService.create(PermissionTypeEnum.WorkflowCommands, PermissionActionTypeEnum.Delete);

  public workflowCommandDetails$ = this.store.select(selectors.workflowCommandDetails);
  private ngUnsubscribe$ = new Subject<void>();

  get hasChanges(): boolean {
    return (this.form.dirty || !this.form.pristine);
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
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
    delete: {
      callback: () => this.onDelete(),
      hidden: () => this.canEdit || this.isNewTask,
      permissions: this.deletePermission,
    },
  };

  public form: UntypedFormGroup = new UntypedFormGroup({
    id: new UntypedFormControl(null),
    name: new UntypedFormControl('', Validators.required),
    description: new UntypedFormControl(''),
    productType: new UntypedFormControl(''),
    beginStatus: new UntypedFormControl('', Validators.required),
    endStatus: new UntypedFormControl('', Validators.required),
    managementInstructions: new UntypedFormControl(''),
    fieldsToUpdate: new UntypedFormControl(''),
    automaticNote: new UntypedFormControl(''),
  });

  constructor(
    private store: Store<AppState>,
    public serverErrorService: ServerErrorService,
    private readonly route: ActivatedRoute,
    private toaster: ToastService,
    private readonly actionsSubj: ActionsSubject,
    private messageService: MessageService,
    private readonly router: Router,
  ) { super(); }

  ngOnInit(): void {
    const taskId = this.route.snapshot.params.id;
    this.isNewTask = !taskId;
    this.canEdit = !taskId;
    this.store.dispatch(actions.GetWorkflowCommandsFilters({ filterType: WorkflowCommandFilterTypesEnum.BeginStatus }));
    this.store.dispatch(actions.GetWorkflowCommandsFilters({ filterType: WorkflowCommandFilterTypesEnum.EndStatus }));
    this.store.dispatch(actions.GetWorkflowCommandsFilters({ filterType: WorkflowCommandFilterTypesEnum.PaymentType }));

    this.title = taskId ? 'Workflow Command' : 'New Workflow Command';

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.UpdateWorkflowCommandComplete,
      ),
    ).subscribe(() => {
      this.form.markAsPristine();
      this.canEdit = false;
      this.isSavePerformed = true;
    });

    if (taskId) {
      this.workflowCommandDetails$
        .pipe(
          filter((workflowCommand: WorkflowCommand) => !!workflowCommand),
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe((workflowCommand: WorkflowCommand) => {
          this.workflowCommandDetails = workflowCommand;
          this.canEdit = false;
        });

      this.store.dispatch(actions.GetWorkflowCommandDetails({ taskId }));
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(ClearWorkflowCommandDetails());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private onDelete(): void {
    this.messageService.showDeleteConfirmationDialog(
      'Confirm delete',
      'Are you sure you want to delete selected Workflow Command?',
    )
      .subscribe((answer:boolean) => {
        if (answer) {
          this.store.dispatch(actions.DeleteWorkflowCommand({ id: this.workflowCommandDetails.id }));
        }
      });
  }

  public onEdit(): void {
    super.edit();
    this.isSavePerformed = false;
    this.initForm();
  }

  private initForm(): void {
    this.form.patchValue({
      id: this.workflowCommandDetails?.id,
      name: this.workflowCommandDetails?.name,
      description: this.workflowCommandDetails?.description,
      productType: this.workflowCommandDetails?.productType,
      beginStatus: this.workflowCommandDetails?.beginStatus,
      endStatus: this.workflowCommandDetails?.endStatus,
      managementInstructions: this.workflowCommandDetails?.managementInstructions,
      fieldsToUpdate: this.workflowCommandDetails?.fieldsToUpdate,
      automaticNote: this.workflowCommandDetails?.automaticNote,
    });
  }

  public onSave(): void {
    if (!this.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }
    super.save();
    const { endStatus, beginStatus, productType } = this.form.value;
    const workflowCommandDetails = {
      ...this.form.value,
      endStatus: endStatus?.name ? endStatus.name : endStatus,
      beginStatus: beginStatus?.name ? beginStatus.name : beginStatus,
      productType: productType?.name ? productType.name : productType,
    };

    this.store.dispatch(actions.UpdateWorkflowCommand({ workflowCommandDetails }));
  }

  onBack(): void {
    this.store.dispatch(actions.GotoWorkflowCommands());
  }

  private onCancel(): void {
    if (this.workflowCommandDetails) {
      this.canEdit = false;
    }
    this.initForm();
    this.form.markAsPristine();
  }
}
