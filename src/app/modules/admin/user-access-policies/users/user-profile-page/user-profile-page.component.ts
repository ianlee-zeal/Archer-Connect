/* eslint-disable no-restricted-globals */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ActionsSubject, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { User, PaginatorParams } from '@app/models';
import { ModalService } from '@app/services/modal.service';
import { ValidationComponent } from '@app/modules/shared/_interfaces/validation-component';
import { MessageService } from '@app/services/message.service';
import { NavigationSettings } from '@shared/action-bar/navigation-settings';

import { commonSelectors } from '@shared/state/common.selectors';
import * as commonActions from '@shared/state/common.actions';
import { DateFormatPipe } from '@shared/_pipes/date-format.pipe';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as services from '@app/services';
import * as paginatorActions from '@shared/grid-pager/state/actions';
import { UsersState } from '../state/state';
import { UnlockUserRequest } from '../state/actions';
import { AddNewRoleModalComponent } from '../add-new-role-modal/add-new-role-modal.component';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import * as accessPoliciesSelectors from '../../access-policies/state/selectors';
import * as fromUserAccessPolicies from '../../orgs/state';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { ofType } from '@ngrx/effects';

@Component({
  selector: 'user-profile-page',
  templateUrl: 'user-profile-page.component.html',
  styleUrls: ['./user-profile-page.styles.scss'],
})
export class UserProfilePageComponent implements OnInit, OnDestroy {
  public ngDestroyed$ = new Subject<void>();

  private activeTabComponent: ValidationComponent;
  readonly allAccessPolicy$ = this.store.select(accessPoliciesSelectors.accessPoliciesIndex);
  readonly selectedRole$ = this.store.select(selectors.selectedUserRole);
  readonly initialUser$ = this.store.select(selectors.currentUser);
  readonly userDetailsHeader$ = this.store.select(selectors.userDetailsHeader);
  readonly isValid$ = this.store.select(selectors.isCurrentUserValid);
  readonly gridParams$ = this.store.select(selectors.agGridParams);
  readonly pager$ = this.store.select(commonSelectors.pager);
  private readonly organization$ = this.store.select(fromUserAccessPolicies.item);

  public initialUser: User;
  public activeTab: string = 'details';
  public title: string;
  public elements: ContextBarElement[];
  public isValidUser = false;
  public isLocked: boolean;
  public hasEdited: boolean = false;
  public isResendActive: boolean | null = false;
  public isResetMfaEnabled: boolean;
  public userRolesPermission = PermissionService.create(PermissionTypeEnum.UserRoles, PermissionActionTypeEnum.Read);
  private gridParams: IServerSideGetRowsRequestExtended;
  private isActive: boolean;
  private organizationId: number;

  public actionBarActionHandlersForDetails: ActionHandlersMap = {
    save: {
      callback: () => this.saveUser(),
      disabled: () => !this.hasEdited,
      permissions: PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Edit),
      awaitedActionTypes: [
        actions.SaveUserCompleted.type,
        actions.Error.type,
        commonActions.FormInvalid.type,
      ],
    },
    back: {
      callback: () => this.back(),
      disabled: () => this.hasEdited,
    },
    cancel: {
      callback: () => this.cancel(),
      disabled: () => !this.hasEdited,
      permissions: PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Edit),
    },
    delete: {
      callback: () => this.deleteUser(),
      disabled: () => !this.isActive,
      permissions: PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Delete),
    },
    unlockAccount: {
      callback: () => this.unlockUser(),
      disabled: () => !this.isLocked,
      permissions: PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.UnlockAccount),
    },
    resentRegistration: {
      callback: () => this.resendActivationEmail(),
      disabled: () => !this.isResendActive,
      permissions: PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.ResendRegistration),
    },
    resetMFA: {
      callback: () => this.resetMFA(),
      disabled: () => !this.isResetMfaEnabled,
      tooltip: () => 'Reset Multi Factor Authentication',
      permissions: PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.ResetMFA),
    },
  };

  public actionHandlersForUserRoles: ActionHandlersMap = {
    new: {
      callback: () => this.modalService.show(AddNewRoleModalComponent, {
        class: 'add-role-modal',
        initialState: { orgId: this.organizationId },
      }),
      permissions: PermissionService.create(PermissionTypeEnum.UserRoles, PermissionActionTypeEnum.Create),
    },
    delete: {
      callback: () => this.removeSelectedRole(),
      disabled: () => this.isDeleteRoleButtonDisabled,
      permissions: PermissionService.create(PermissionTypeEnum.UserRoles, PermissionActionTypeEnum.Delete),
    },
    back: { callback: () => this.back() },
  };

  public navigationSettings: NavigationSettings;

  private isDeleteRoleButtonDisabled: boolean = true;
  private readonly id: number | null;

  constructor(
    private store: Store<UsersState>,
    private route: Router,
    private modalService: ModalService,
    private activeRoute: ActivatedRoute,
    private messageService: MessageService,
    private toaster: services.ToastService,
    private usersService: services.UsersService,
    private readonly dateFormatPipe: DateFormatPipe,
    private actionsSubj: ActionsSubject,
  ) {
    this.id = Number(activeRoute.snapshot.params.id);
  }

  public ngOnInit(): void {
    this.activeTab = this.route.url.split('/').pop();

    this.route.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.ngDestroyed$),
      )
      .subscribe(event => {
        this.activeTab = event.url.split('/').pop();
      });

    if (this.id) {
      this.store.dispatch(actions.GetUser({ id: this.id }));
    }

    this.initialUser$.pipe(
      filter(user => !!user),
      takeUntil(this.ngDestroyed$),
    )
      .subscribe(user => {
        if (!this.initialUser) {
          this.initialUser = user;
        } else {
          this.hasEdited = true;
        }
      });

    this.userDetailsHeader$
      .pipe(
        filter(user => user !== null),
      )
      .subscribe((user: User) => {
        this.title = user.displayName;
        this.elements = [
          { column: 'Email', valueGetter: () => user.email },
          { column: 'Username', valueGetter: () => user.userName },
          { column: 'Last login date', valueGetter: () => this.dateFormatPipe.transform(user.lastLoginDate, false, null, null, true) },
          { column: 'Last IP', valueGetter: () => user.lastIp },
        ];
        this.isLocked = user.isLocked;
        this.isResendActive = (user.isEmailConfirmed === false || user.isEmailConfirmed === null) && user.isActive;
        this.isResetMfaEnabled = user.isResetMfaEnabled;
        this.isActive = user.isActive;
      });

    this.isValid$
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe(x => {
        this.isValidUser = x;
      });

    this.selectedRole$
      .pipe(
        takeUntil(this.ngDestroyed$),
      )
      .subscribe(x => {
        this.isDeleteRoleButtonDisabled = !x;
      });

    this.gridParams$
      .pipe(
        filter(x => x != null),
        takeUntil(this.ngDestroyed$),
      )
      .subscribe(params => {
        this.gridParams = params;
      });

    this.organization$.pipe(
      filter(x => x != null),
      takeUntil(this.ngDestroyed$),
    ).subscribe(organization => {
      this.organizationId = organization.id;
    });

    this.actionsSubj
      .pipe(
        takeUntil(this.ngDestroyed$),
        ofType(actions.AddRoleToUserCompleted, actions.RemoveUserRoleCompleted),
      ).subscribe(() => {
        this.store.dispatch(actions.GetUserRoles());
      });
  }

  private cancel() {
    this.store.dispatch(actions.UpdateUser({ user: this.initialUser, userDetailsForm: null }));
    this.hasEdited = false;
  }

  public saveUser() {
    if (this.activeTabComponent.validate()) {
      this.store.dispatch(actions.SaveUser());
      this.hasEdited = false;
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(commonActions.FormInvalid());
    }
  }

  private unlockUser(): void {
    this.messageService.showConfirmationDialog(
      'Confirm operation',
      'Are you sure you want to unlock this user?',
    )
      .subscribe(answer => {
        if (answer) {
          this.store.dispatch(UnlockUserRequest({ userId: this.id }));
        }
      });
  }

  private resendActivationEmail(): void {
    this.store.dispatch(actions.ResendActivationEmailRequest({ userId: this.id }));
  }

  private resetMFA(): void {
    this.messageService.showConfirmationDialog(
      'Confirm operation',
      'Are you sure you want to reset MFA cell phone for this user?',
    )
      .subscribe(answer => {
        if (answer) {
          this.store.dispatch(actions.ResetMFARequest({ userId: this.initialUser.appUserId }));
        }
      });
  }

  private deleteUser(): void {
    this.messageService.showConfirmationDialog(
      'Confirm operation',
      'Are you sure you want to deactivate this user?',
    ).subscribe(answer => {
      if (answer) {
        this.store.dispatch(actions.DeleteUserRequest({
          userId: this.id,
          organizationId: this.organizationId,
        }));
      }
    });
  }

  public back(): void {
    this.store.dispatch(commonActions.GotoParentView());
  }

  public removeSelectedRole(): void {
    this.selectedRole$.pipe(first())
      .subscribe(role => {
        this.messageService.showConfirmationDialog(
          'Confirm operation',
          'Are you sure you want to remove this role?',
        )
          .subscribe(answer => {
            if (answer) {
              this.store.dispatch(actions.RemoveUserRole({ role }));
            }
          });
      });
  }

  public onTabChanged(tabComponent: ValidationComponent) {
    this.activeTabComponent = tabComponent;
  }

  public toPage(pageNumber: number): void {
    this.store.dispatch(commonActions.UpdatePager({ pager: { currentPage: pageNumber } }));
    this.store.dispatch(paginatorActions.Paginator({
      pageNumber,
      prevId: this.activeRoute.snapshot.params.id,
      apiCall: this.usersService.grid.bind(this.usersService),
      callback: this.paginatorCallBack.bind(this),
      params: <PaginatorParams>{ gridParams: this.gridParams },
    }));
  }

  private paginatorCallBack(id: number) {
    this.store.dispatch(actions.GetUser({ id }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.ResetUser());
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
