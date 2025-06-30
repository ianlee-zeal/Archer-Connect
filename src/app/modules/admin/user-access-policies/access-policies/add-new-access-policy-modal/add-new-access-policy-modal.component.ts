import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { Subject, filter, takeUntil } from 'rxjs';
import { PermissionService, ToastService } from '@app/services';
import { autoFocusFieldAsyncValidator } from '@app/validators/auto-focus-field.validator';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { ValidationForm } from '../../../../shared/_abstractions/validation-form';
import * as fromRoot from '../../../../../state';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { Org } from '@app/models';
import * as fromOrgs from '../../../user-access-policies/orgs/state'
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';

@Component({
  selector: 'app-add-new-access-policy-modal',
  templateUrl: './add-new-access-policy-modal.component.html',
  styleUrls: ['./add-new-access-policy-modal.component.scss'],
})
export class AddNewAccessPolicyModalComponent extends ValidationForm implements OnInit, OnDestroy {
  public item: UntypedFormGroup;
  public ngDestroyed$ = new Subject<void>();
  public error$ = this.store.select(selectors.error);
  public orgId: number;
  public org$ = this.store.select(fromOrgs.item);
  public isMaster = false;
  public levelOptions: { name: string, id: number | null }[];

  readonly awaitedActionTypes = [
    actions.AddAccessPolicySuccess.type,
    actions.AddAccessPolicyError.type,
    commonActions.FormInvalid.type,
  ];

  constructor(
    private fb: UntypedFormBuilder,
    public modal: BsModalRef,
    private store: Store<fromRoot.AppState>,
    private toaster: ToastService,
    private permissionService: PermissionService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.org$.pipe(
      filter((item: Org) => !!item),
      takeUntil(this.ngDestroyed$)
    ).subscribe((org: Org) => {
      this.isMaster = org.isMaster;
      this.configureForm();
    });

    this.configureForm();
    this.setupLevelOptions();
  }

  public hasPermission(): boolean {
    return this.permissionService.has(PermissionService.create(PermissionTypeEnum.AccessPolicies, PermissionActionTypeEnum.SetPolicyLevel));
  }

  protected get validationForm(): UntypedFormGroup {
    return this.item;
  }

  public cancel() : void {
    this.modal.hide();
  }

  public save() : void {
    if (super.validate()) {
      this.store.dispatch(actions.AddAccessPolicyRequest({
        item: {
          ...this.item.value,
          organizationId: this.item.get('level').value,
        },
        modal: this.modal,
      }));
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(commonActions.FormInvalid());
    }
  }

  private setupLevelOptions(): void {
    this.levelOptions = [
      { name: 'Organization', id: this.orgId },
      { name: 'Global', id: null },
    ];
  }

private configureForm(): void {
  this.item = this.fb.group({
    name: ['', [Validators.minLength(4), Validators.maxLength(60)], autoFocusFieldAsyncValidator],
    description: ['', [Validators.maxLength(255)]],
    level: [this.orgId]
  });
}

  public ngOnDestroy(): void {
    this.store.dispatch(actions.ClearError());
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
