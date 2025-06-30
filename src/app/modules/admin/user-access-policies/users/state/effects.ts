import { TeamToUser } from '@app/models/team-to-user';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { mergeMap, map, catchError, tap, switchMap, withLatestFrom } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { User } from '@app/models';
import { OrganizationRole } from '@app/models/organization-role';
import * as services from '@app/services';
import { LogService } from '@app/services/log-service';
import { TeamsService } from '@app/services';
import { UsersState } from './state';
import * as selectors from './selectors';
import * as actions from './actions';

@Injectable()
export class UsersEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<UsersState>,
    private readonly usersService: services.UsersService,
    private readonly organizationRolesService: services.OrganizationRolesService,
    private readonly organizationRoleUserService: services.OrganizationRolesUserService,
    private readonly teamsService: TeamsService,
    private readonly router: Router,
    private readonly toaster: services.ToastService,
    private readonly logService: LogService,
  ) { }

  getAGAdminUsers$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAllUsersActionRequest),
    mergeMap(action => this.usersService.grid(action.params.request)
      .pipe(
        switchMap(response => {
          const userModels = response.items.map(User.toModel);
          return [
            actions.GetAllUsersActionComplete({ users: userModels, agGridParams: action.params, totalRecords: response.totalRecordsCount }),
          ];
        }),
        catchError(error => of(actions.GetAllUsersActionError({ errorMessage: error, agGridParams: action.params }))),
      )),
  ));

  getAGAdminUsersComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAllUsersActionComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.users, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  getAGAdminUsersError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAllUsersActionError),
    tap(action => {
      console.error(action.errorMessage); // eslint-disable-line no-console
      action.agGridParams.fail();
    }),
  ), { dispatch: false });

  getUser$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetUser),
    switchMap(action => this.usersService.get(action.id)),
    switchMap(user => [actions.GetUserCompleted({ user: User.toModel(user) })]),
  ));

  saveUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.SaveUser),
      withLatestFrom(this.store$.select(selectors.currentUser)),
      map(([, user]) => user),
      switchMap(user =>
        (user.id
          ? this.usersService.put(User.toDTO(user))
          : this.usersService.post(User.toDTO(user))
        ).pipe(
          tap(() => this.toaster.showSuccess('User was updated')),
          map(() => actions.SaveUserCompleted()),
          catchError(error => of(actions.Error({ error })))
        )
      )
    )
  );

  createNewUser$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateNewUserRequest),
    mergeMap(action => this.usersService.createUser(action.user).pipe(
      switchMap((user: any) => [
        actions.CreateNewUserSuccess({ user: User.toModel(user) }),
        actions.AfterCreateNewUserRedirect({ userId: user.id }),
      ]),
      catchError(error => of(actions.CreateNewUserError({ error }))),
    )),
  ));

  deleteUserById$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DeleteUserRequest),
    switchMap(({ userId, organizationId }) => this.usersService.delete(userId).pipe(
      mergeMap(() => [actions.GoToOrganizationUsers({ organizationId }), actions.DeleteUserSuccess({ userId })]),
      catchError(error => {
        this.logService.log(error);
        return [
          actions.Error({ error: 'Something went wrong during Delete User operation' }),
          actions.DeleteUserError({ userId }),
        ];
      }),
    )),
  ));

  unlockUser$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UnlockUserRequest),
    switchMap(({ userId }) => this.usersService.unlock({ userId }).pipe(
      mergeMap(() => [actions.GetUser({ id: userId }), actions.UnlockUserSuccess()]),
      catchError(error => {
        actions.Error({ error });
        return of(actions.UnlockUserError());
      }),
    )),
  ));

  unlockUserSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UnlockUserSuccess),
    tap(() => this.toaster.showSuccess('User was unlocked')),
  ), { dispatch: false });

  addRoleToUser$ = createEffect(() => this.actions$.pipe(
    ofType(actions.AddRoleToUser),

    mergeMap(action => {
      return this.organizationRoleUserService.addRolesToUser(action.roles).pipe(
        switchMap(() => {
          this.toaster.showSuccess('Role was added');
          return [
            actions.AddRoleToUserCompleted(),
          ];
        }),
        catchError(() => of(actions.AddRoleToUserError())),
      );
    }),
  ));

  removeUserRole$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.RemoveUserRole),
    withLatestFrom(this.store$.select(selectors.currentUser)),
    mergeMap(([action]) => this.organizationRoleUserService.delete(action.role.id).pipe(
      switchMap(() => {
        this.toaster.showSuccess('Role was deleted');
        return [
          actions.RemoveUserRoleCompleted(),
        ];
      }),
    )),
  ));

  getUserRoles$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetUserRoles),
    withLatestFrom(this.store$.select(selectors.currentUser)),
    mergeMap(([, user]) => this.usersService.getRoles(user.id).pipe(
      switchMap(roles => [
        actions.GetUserRolesComplete({ roles: roles.map(r => OrganizationRole.toModel(r)) }),
      ]),
    )),
  ));

  getUserTeams$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetUserTeams),
    mergeMap(action => this.teamsService.getUserTeams(action.userId).pipe(
      switchMap(teams => [
        actions.GetUserTeamsComplete({ teams: teams.map(TeamToUser.toModel) }),
      ]),
    )),
  ));

  getTeams$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTeams),
    mergeMap(() => this.teamsService.getTeams().pipe(
      switchMap(teams => [
        actions.GetTeamsComplete({ teams }),
      ]),
    )),
  ));

  createOrUpdateUserTeamRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateOrUpdateUserTeamRequest),
    mergeMap(action => this.teamsService.createOrUpdateUserTeam(TeamToUser.toDto(action.team, action.reassign)).pipe(
      switchMap(response => {
        if (response.teamManagerExists) {
          return [actions.ShowConfirmationDialogForUserTeamRequest({ team: action.team })];
        }
        return [
          actions.CreateOrUpdateUserTeamSuccess({ team: TeamToUser.toModel(response) }),
        ];
      }),
      catchError(error => of(actions.CreateOrUpdateUserTeamError({ error }))),
    )),
  ));

  resendActivationEmail$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.ResendActivationEmailRequest),
    switchMap(({ userId }) => this.usersService.resendActivationEmail(userId).pipe(
      map(() => actions.ResendActivationEmailSuccess({ userId })),
      catchError(error => {
        actions.Error({ error });

        return of(actions.ResendActivationEmailError({ userId }));
      }),
    )),
  ));

  resendActivationEmailError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ResendActivationEmailError),
    tap(() => this.toaster.showError('Resend Registration email operation was failed.')),
  ), { dispatch: false });

  getUnassignedOrganizationRoles$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetUnassignedOrganizationRoles),
    withLatestFrom(this.store$.select(selectors.currentUser)),
    mergeMap(([action, user]) => this.organizationRolesService.getUnassignedOrganizationRoles(user.id, action.orgId).pipe(
      switchMap(roles => [actions.GetUnassignedOrganizationRolesComplete({ roles })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  deleteUserByIdSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteUserSuccess),
    tap(() => this.toaster.showSuccess('User was successfully removed')),
  ), { dispatch: false });

  gotoUsers$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToOrganizationUsers),
    tap(({ organizationId }) => {
      this.router.navigate([`/admin/user/orgs/${organizationId}/users`], { state: { restoreSearch: true } });
    }),
  ), { dispatch: false });

  gotoUserProfile$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GotoUserProfile),
    tap(({ userId, navSettings }) => this.router.navigate(
      [`${this.router.url}/${userId}/tabs/details`],
      { state: { navSettings } },
    )),
  ), { dispatch: false });

  afterCreateNewUserRedirect$ = createEffect(() => this.actions$.pipe(
    ofType(actions.AfterCreateNewUserRedirect),
    tap(() => {
      this.toaster.showSuccess('User was created');
    }),
  ), { dispatch: false });

  resendActivationEmailSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ResendActivationEmailSuccess),
    tap(() => this.toaster.showSuccess('Activation email was successfully sent')),
  ), { dispatch: false });

  getOrganizationRoles$ = createEffect(() => this.actions$.pipe( //GetOrganizationRoles with Roles.Read Permission
    ofType(actions.GetOrganizationRoles),
    mergeMap(action => this.organizationRolesService.getOrganizationRoles(action.orgId).pipe(
      switchMap(roles => [actions.GetOrganizationRolesComplete({ roles })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  GetOrganizationRolesForUserCreation$ = createEffect(() => this.actions$.pipe( //GetOrganizationRoles with User.Create Permission
    ofType(actions.GetOrganizationRolesForUserCreation),
    mergeMap(action => this.usersService.getOrganizationRolesForUserCreation(action.orgId).pipe(
      switchMap(roles => [actions.GetOrganizationRolesForUserCreationComplete({ roles })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap(({ error }) => {
      this.toaster.showError(error);
    }),
  ), { dispatch: false });

  resetMFARequest$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.ResetMFARequest),
    withLatestFrom(this.store$.select(selectors.currentUser)),
    mergeMap(([action, currentUser]) => this.usersService.deleteMfa(action.userId).pipe(
      switchMap(() => [
        actions.ResetMFASuccess(),
        actions.GetUser({ id: currentUser.id }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  resetMFASuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ResetMFASuccess),
    tap(() => this.toaster.showSuccess('MFA cell phone was successfully removed')),
  ), { dispatch: false });
}
