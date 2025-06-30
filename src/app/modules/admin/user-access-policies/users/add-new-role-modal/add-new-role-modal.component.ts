import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UsersState } from '../state/state';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { User } from '@app/models';
import { MultipleOrganizationRoleUserRequest } from '@app/models/Multipleorganization-Role-Users';
import { OrganizationRoleUser } from '@app/models/organization-role-user';

@Component({
  selector: 'app-add-new-role-modal',
  templateUrl: './add-new-role-modal.component.html',
  styleUrls: ['./add-new-role-modal.component.scss'],
})
export class AddNewRoleModalComponent implements OnInit, OnDestroy {
  readonly roles$ = this.store.select(selectors.unassignedOrganizationRoles);
  readonly currentUser$ = this.store.select(selectors.currentUser);
  public ngDestroyed$ = new Subject<void>();

  public roleOptions: SelectOption[] = [];
  public selectedRoles: SelectOption[] = [];
  private user: User;

  public orgId: number;

  readonly awaitedAddActionTypes = [
    actions.AddRoleToUserError.type,
    actions.AddRoleToUserCompleted.type,
  ];

  constructor(
    private store: Store<UsersState>,
    public addNewRoleModal: BsModalRef,
  ) { }

  public ngOnInit(): void {
    this.store.dispatch(actions.GetUnassignedOrganizationRoles({ orgId: this.orgId }));

    this.roles$.pipe(
      filter(roles => !!roles),
      takeUntil(this.ngDestroyed$),
    ).subscribe(roles => {
      this.roleOptions = [...roles.map(role => ({ id: role.id, name: role.name }))]
    });
    this.subscribeToUser();
  }

  subscribeToUser(): void {
    this.currentUser$.pipe(
      filter(user => !!user),
      takeUntil(this.ngDestroyed$),
    ).subscribe(user => {
      this.user = user;
    });
  }

  updateSelectedRoles(value: SelectOption[]): void {
    this.selectedRoles = value;
    this.roleOptions = this.roleOptions.map(item => (
      { ...item, checked: value.includes(item) }
    ));
  }

  public addRole(): void {
    const organizationRoleUsers = new MultipleOrganizationRoleUserRequest();
    organizationRoleUsers.items = this.selectedRoles.map(role => {
      const organizationRoleUser = new OrganizationRoleUser();
      organizationRoleUser.organizationRoleId = Number(role.id);
      organizationRoleUser.userId = this.user.id;
      organizationRoleUser.isGlobal = false;

      return organizationRoleUser;
    });

    this.store.dispatch(actions.AddRoleToUser({ roles: organizationRoleUsers}));
    this.cancel();
  }

  public cancel(): void {
    this.addNewRoleModal.hide();
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.AddRoleCanceled());
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
