import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Store, ActionsSubject } from '@ngrx/store';

import { AccessPolicy } from '@app/models';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ServerErrorService, MessageService, PermissionService } from '@app/services';
import { ofType } from '@ngrx/effects';
import * as services from '@app/services';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as selectors from '../state/selectors';
import * as fromUserAccessPoliciesState from '../../state/state';
import * as actions from '../state/actions';
import * as fromOrgs from '../../../user-access-policies/orgs/state'
import { GotoParentView } from '../../../../shared/state/common.actions';

@Component({
  selector: 'app-user-access-policies-detail',
  templateUrl: './user-access-policies-detail.component.html',
  styleUrls: ['./user-access-policies-detail.component.scss'],
})
export class UserAccessPoliciesDetailComponent extends Editable implements OnInit, OnDestroy {
  public ngDestroyed$ = new Subject<void>();
  public item$ = this.store.select(selectors.accessPoliciesItem);
  public error$ = this.store.select(selectors.error);
  private org$ = this.store.select(fromOrgs.item);


  private id: number | null;
  public initialItem: AccessPolicy;
  private isMaster: boolean = false;
  public canEditAccessPolicies: boolean;

  public fg = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(60)]],
    description: ['', [Validators.maxLength(255)]],
  });

  get hasChanges(): boolean {
    return this.fg.dirty || !this.fg.pristine;
  }

  protected get validationForm(): UntypedFormGroup {
    return this.fg;
  }

  constructor(
    private store: Store<fromUserAccessPoliciesState.AppState>,
    private fb: UntypedFormBuilder,
    public serverErrorService: ServerErrorService,
    private actionsSubj: ActionsSubject,
    private toaster: services.ToastService,
    private messageService: MessageService,
    private permissionService: PermissionService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.UpdateAccessPoliciesActionBar({
      actionBar: {
        save: {
          callback: () => this.onSave(this.initialItem),
          disabled: () => this.canLeave,
          permissions: PermissionService.create(PermissionTypeEnum.AccessPolicies, PermissionActionTypeEnum.Edit),
          awaitedActionTypes: [
            actions.UpdateAccessPolicyRequest.type,
            actions.UpdateAccessPolicyError.type,
          ],
        },
        delete: {
          callback: () => this.onDelete(),
          permissions: PermissionService.create(PermissionTypeEnum.AccessPolicies, PermissionActionTypeEnum.Delete),
        },
        cancel: {
          callback: () => this.onCancel(),
          disabled: () => this.canLeave && this.validationForm.valid,
          permissions: PermissionService.create(PermissionTypeEnum.AccessPolicies, PermissionActionTypeEnum.Edit),
        },
        back: {
          callback: () => this.store.dispatch(GotoParentView()),
          disabled: () => !this.canLeave,
        },
      },
    }));

    this.actionsSubj.pipe(
      takeUntil(this.ngDestroyed$),
      ofType(actions.UpdateAccessPolicyError),
    ).subscribe(data => this.serverErrorService.showServerErrors(this.fg, data));

    this.item$.pipe(
      take(1),
    )
      .subscribe(item => {
        this.initialItem = item;
        this.id = item.id;
      });

    this.subscribeToOrg();

    if(!this.canEditAccessPolicies ) {
      this.fg.disable();
    }
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }

  private subscribeToOrg(): void {
    this.org$.pipe(takeUntil(this.ngDestroyed$))
      .subscribe(org => {
        this.isMaster = org.isMaster;

        const isGlobalPolicy = this.initialItem.organizationId === null;

        this.canEditAccessPolicies = this.permissionService.canEdit(PermissionTypeEnum.AccessPolicies) && (!isGlobalPolicy || (isGlobalPolicy && this.isMaster));
      });
  }

  private onSave(item: AccessPolicy): void {
    if (!super.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }

    const { name, description } = this.fg.value;

    this.store.dispatch(actions.UpdateAccessPolicyRequest({
      item: {
        ...item,
        name,
        description,
      } as AccessPolicy,
    }));
  }

  private onCancel(): void {
    this.fg.setValue({
      name: this.initialItem.name,
      description: this.initialItem.description,
    });
    this.fg.markAsPristine();
  }

  private onDelete(): void {
    this.messageService.showDeleteConfirmationDialog(
      'Confirm delete',
      'Are you sure you want to delete selected Access Policy?',
    )
      .subscribe(answer => {
        if (answer) {
          this.delete();
        }
      });
  }

  private delete(): void {
    this.store.dispatch(actions.DeleteAccessPoliciesRequest({ ids: [this.id] }));
  }
}
