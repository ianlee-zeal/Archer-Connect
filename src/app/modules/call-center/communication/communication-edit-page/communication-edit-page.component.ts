import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UrlHelper } from '@app/helpers/url-helper';
import { CommunicationRecord } from '@app/models/communication-center/communication-record';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { EntityTypeEnum } from '@app/models/enums/entity-type.enum';
import { GridId } from '@app/models/enums/grid-id.enum';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { MessageService, PermissionService, ToastService } from '@app/services';
import { Store } from '@ngrx/store';
import * as fromShared from '@shared/state/common.actions';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { UpdateClaimantsActionBar } from '../../../claimants/claimant-details/state/actions';
import { ClaimantsState } from '../../../claimants/state/reducer';
import { CommunicationDetailsComponent } from '../communication-details/communication-details.component';
import * as actions from '../state/actions';
import { communicationSelectors } from '../state/selectors';

@Component({
  selector: 'app-communication-edit-page',
  templateUrl: './communication-edit-page.component.html',
  styleUrls: ['./communication-edit-page.component.scss'],
})
export class CommunicationEditPageComponent extends Editable implements OnInit, OnDestroy {
  @ViewChild(CommunicationDetailsComponent)
    communicationDetailsComponent: CommunicationDetailsComponent;

  private communicationRecordId: number;
  private parentId: number;

  public currentCommunicationRecord$ = this.store.select(communicationSelectors.currentCommunicationRecord);
  public communicationActionBar$ = this.store.select(communicationSelectors.actionBar);
  public canEditCommunication$ = this.store.select(communicationSelectors.canEditCommunication);

  public actionBar: ActionHandlersMap = {
    save: {
      callback: () => this.saveChanges(),
      disabled: () => this.canLeave,
      hidden: () => !this.canEdit,
      permissions: PermissionService.create(PermissionTypeEnum.ClientCommunications, PermissionActionTypeEnum.Edit),
      awaitedActionTypes: [
        actions.UpdateCommunicationRecordSuccess.type,
        fromShared.FormInvalid.type,
        actions.Error.type,
      ],
    },
    deleteCommunication: {
      callback: () => this.delete(),
      permissions: PermissionService.create(PermissionTypeEnum.ClientCommunications, PermissionActionTypeEnum.Delete),
    },
    cancel: {
      hidden: () => !this.canEdit,
      callback: () => this.cancel(),
    },
  };

  get hasChanges(): boolean {
    if (!this.communicationDetailsComponent) {
      return false;
    }

    return this.communicationDetailsComponent.validationForm.dirty;
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

  ngOnInit(): void {
    this.communicationRecordId = this.getIdFromParams();
    this.parentId = +UrlHelper.getParent(this.router.url, '/overview');

    if (!this.communicationRecordId) {
      return;
    }

    this.currentCommunicationRecord$
      .pipe(
        filter((record: CommunicationRecord) => !!record),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((record: CommunicationRecord) => {
        const id = this.getIdFromParams();
        if (id !== record.id) {
          this.store.dispatch(actions.GotoCommunication({
            claimantId: this.parentId,
            id: record.id,
            canReadNotes: this.canReadNotes,
            entity: GridId.Claimants,
          }));
        }
      });

    this.communicationActionBar$
      .pipe(
        filter((actionBar: ActionHandlersMap) => !!actionBar),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((actionBar: ActionHandlersMap) => {
        this.store.dispatch(UpdateClaimantsActionBar({
          actionBar: {
            ...this.actionBar,
            ...actionBar,
          },
        }));
      });

    this.canEditCommunication$
      .pipe(
        filter((canEdit: boolean) => !!canEdit),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((canEdit: boolean) => {
        this.canEdit = canEdit;
      });

    this.store.dispatch(actions.GetCommunicationRecordRequest({ communicationRecordId: this.communicationRecordId }));
  }

  private getIdFromParams(): number {
    return +this.activatedRoute.snapshot.params.id;
  }

  private saveChanges(): void {
    if (this.communicationDetailsComponent.validate()) {
      const communication = CommunicationRecord.fromFormValue(EntityTypeEnum.Clients, this.parentId, this.communicationDetailsComponent.formGroup.value, this.communicationRecordId);

      this.store.dispatch(actions.UpdateCommunicationRecordRequest({
        communicationRecord: communication,
        callback: () => this.saveCompleted(),
      }));
    } else {
      this.store.dispatch(fromShared.FormInvalid());
      this.toaster.showWarning('Form is not valid', 'Cannot save');
    }
  }

  private saveCompleted(): void {
    this.communicationDetailsComponent.validationForm.markAsPristine();
    this.canEdit = false;
  }

  private delete(): void {
    this.messageService.showDeleteConfirmationDialog(
      'Confirm delete',
      'Are you sure you want to delete this communication?',
    )
      .subscribe((answer: boolean) => {
        if (!answer) {
          return;
        }

        this.store.dispatch(actions.DeleteCommunicationRecordRequest({ id: this.communicationRecordId, claimantId: this.parentId }));
      });
  }

  private cancel(): void {
    this.communicationDetailsComponent.hideFieldsDisplayedByCondition();
    this.communicationDetailsComponent.setFormValue();
    this.communicationDetailsComponent.validationForm.markAsPristine();
    this.canEdit = false;
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.SetCanEditCommunication({ canEditCommunication: false }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
