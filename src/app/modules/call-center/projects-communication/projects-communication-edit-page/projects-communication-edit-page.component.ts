import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { EntityTypeEnum } from '@app/models/enums/entity-type.enum';
import { ToastService, MessageService, PermissionService } from '@app/services';
import { UrlHelper } from '@app/helpers/url-helper';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { Subject } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { filter, takeUntil } from 'rxjs/operators';
import * as fromShared from '@shared/state/common.actions';
import * as projectsActions from '@app/modules/projects/state/actions';
import { ProjectCommunicationRecord } from '@app/models/communication-center/project-communication-record';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromSharedSelectors from '@shared/state/index';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { ClaimantsState } from '../../../claimants/state/reducer';
import * as actions from '../../communication/state/actions';
import { communicationSelectors } from '../../communication/state/selectors';
import { ProjectsCommunicationDetailsComponent } from '../projects-communication-details/projects-communication-details.component';

@Component({
  selector: 'app-projects-communication-edit-page',
  templateUrl: './projects-communication-edit-page.component.html',
  styleUrls: ['./projects-communication-edit-page.component.scss'],
})
export class ProjectsCommunicationEditPageComponent extends Editable implements OnInit, OnDestroy {
  @ViewChild(ProjectsCommunicationDetailsComponent) projectsCommunicationDetailsComponent: ProjectsCommunicationDetailsComponent;

  private communicationRecordId: number;
  private parentId: number;

  public currentCommunicationRecord$ = this.store.select(communicationSelectors.currentCommunicationRecord);
  public communicationActionBar$ = this.store.select(communicationSelectors.actionBar);
  public canEditCommunication$ = this.store.select(communicationSelectors.canEditCommunication);

  public actionBar: ActionHandlersMap = {
    back: {
      callback: () => this.store.dispatch(fromShared.GotoParentView()),
      disabled: () => !this.canLeave,
    },
    edit: { ...this.editAction() },
    save: {
      callback: () => this.saveChanges(),
      disabled: () => this.canLeave,
      hidden: () => !this.canEdit,
      permissions: PermissionService.create(PermissionTypeEnum.ProjectsCommunications, PermissionActionTypeEnum.Edit),
      awaitedActionTypes: [
        actions.UpdateCommunicationRecordSuccess.type,
        fromShared.FormInvalid.type,
        actions.Error.type,
      ],
    },
    deleteCommunication: {
      callback: () => this.delete(),
      permissions: PermissionService.create(PermissionTypeEnum.ProjectsCommunications, PermissionActionTypeEnum.Delete),
    },
    cancel: {
      callback: () => this.cancel(),
      hidden: () => !this.canEdit,
    },
  };

  get hasChanges(): boolean {
    if (!this.projectsCommunicationDetailsComponent) {
      return false;
    }

    return this.projectsCommunicationDetailsComponent.validationForm.dirty;
  }

  protected get validationForm(): UntypedFormGroup {
    return null;
  }

  private get canReadNotes(): boolean {
    return this.permissionService.canRead(PermissionTypeEnum.CommunicationNotes);
  }

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<ClaimantsState>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toaster: ToastService,
    private messageService: MessageService,
    private permissionService: PermissionService,
  ) {
    super();
  }

  ngOnInit() {
    this.communicationRecordId = this.getIdFromParams();
    this.parentId = +UrlHelper.getParent(this.router.url, '/overview');

    if (!this.communicationRecordId) {
      return;
    }

    this.currentCommunicationRecord$
      .pipe(
        filter(record => !!record),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(record => {
        const id = this.getIdFromParams();
        if (id !== record.id) {
          this.store.dispatch(actions.GotoCommunication({
            claimantId: this.parentId,
            id: record.id,
            canReadNotes: this.canReadNotes,
            entity: GridId.Projects,
          }));
        }
      });

    this.communicationActionBar$
      .pipe(
        filter(actionBar => !!actionBar),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(actionBar => {
        this.store.dispatch(projectsActions.UpdateActionBar({
          actionBar: {
            ...this.actionBar,
            ...actionBar,
          },
        }));
      });

    this.canEditCommunication$
      .pipe(
        filter(canEdit => !!canEdit),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(canEdit => {
        this.canEdit = canEdit;
      });

    this.store.dispatch(actions.GetProjectCommunicationRecordRequest({ projectCommunicationRecordId: this.communicationRecordId }));
  }

  private getIdFromParams(): number {
    return +this.activatedRoute.snapshot.params.id;
  }

  private saveChanges(): void {
    if (this.projectsCommunicationDetailsComponent.validate()) {
      const { sentiment, partyType, callerName } = this.projectsCommunicationDetailsComponent.formGroup.controls;

      const communication = ProjectCommunicationRecord.fromFormValue(EntityTypeEnum.Projects, this.parentId, {
        ...this.projectsCommunicationDetailsComponent.formGroup.value,
        sentiment: sentiment.value,
        partyType: partyType.value,
        callerName: callerName.value,
      }, this.communicationRecordId);

      this.store.dispatch(actions.UpdateProjectCommunicationRecordRequest({
        projectCommunicationRecord: communication,
        callback: () => this.saveCompleted(),
      }));
    } else {
      this.store.dispatch(commonActions.FormInvalid());
      this.toaster.showWarning('Form is not valid', 'Cannot save');
    }
  }

  private saveCompleted() {
    this.canEdit = false;
    this.projectsCommunicationDetailsComponent.validationForm.markAsPristine();
  }

  private delete(): void {
    this.messageService.showDeleteConfirmationDialog(
      'Confirm delete',
      'Are you sure you want to delete this communication?',
    )
      .subscribe(answer => {
        if (!answer) {
          return;
        }

        this.projectsCommunicationDetailsComponent.validationForm.markAsPristine();
        this.store.dispatch(actions.DeleteProjectCommunicationRecordRequest({ id: this.communicationRecordId, projectId: this.parentId }));
      });
  }

  private cancel() {
    this.projectsCommunicationDetailsComponent.hideFieldsDisplayedByCondition();
    this.projectsCommunicationDetailsComponent.setFormValue();
    this.projectsCommunicationDetailsComponent.validationForm.markAsPristine();
    this.canEdit = false;
    this.store.dispatch(actions.GetProjectCommunicationRecordRequest({ projectCommunicationRecordId: this.communicationRecordId }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(fromSharedSelectors.sharedActions.documentsListActions.ClearDocuments());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
