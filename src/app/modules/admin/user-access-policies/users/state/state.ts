import { UntypedFormGroup } from '@angular/forms';

import { User, IdValue } from '@app/models';
import { OrganizationRole } from '@app/models/organization-role';
import { OrganizationRoleUser } from '@app/models/organization-role-user';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

export interface UsersState {
  currentUser: User;
  userDetailsHeader: User;
  index: User[];
  selectedAccessPolicies: IdValue[];
  userDetailsForm: UntypedFormGroup;
  unassignedOrganizationRoles: OrganizationRole[];
  selectedUserRole: OrganizationRoleUser;
  error: string,
  organizationRoles: OrganizationRole[];
  agGridParams: IServerSideGetRowsRequestExtended;
  actionBar: ActionHandlersMap,
  teams: IdValue[],
}

export const usersInitialState: UsersState = {
  currentUser: null,
  userDetailsHeader: null,
  index: null,
  selectedAccessPolicies: [],
  userDetailsForm: null,
  unassignedOrganizationRoles: [],
  selectedUserRole: null,
  error: null,
  organizationRoles: [],
  agGridParams: null,
  actionBar: null,
  teams: [],
};
