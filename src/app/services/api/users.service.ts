import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUserRequest } from '@app/models/users/create-user.request';
import { UnlockUserRequest } from '@app/models/users/unlock-user.request';
import { UserProfileDetails } from '@app/models/user-profile-details';
import { User, AccessPolicy, IdValue } from '@app/models';
import { StringHelper } from '@app/helpers/string.helper';
import { OrganizationRoleUser } from '@app/models/organization-role-user';
import { AuthyUpdateRequest } from '@app/models/users';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { OrganizationRole } from '@app/models/organization-role';
import { UserLoginReportRequest } from '@app/models/users-audit/user-login-report-request';
import { SaveDocumentGeneratorRequest } from '@app/models/documents/document-generators/save-document-generator-request';

@Injectable({ providedIn: 'root' })
export class UsersService extends RestService<User> {
  public endpoint = '/users';
  public rolesRoute = 'roles';
  public countriesEndpoint = '/countries';
  public usersAuditEndpoint = '/users-audit';

  public getUserAuth(userId: number): Observable<any> {
    return this.api.get<CreateUserRequest>(`${this.endpoint}/auth/${userId}`);
  }

  public getUsers(data: any, search: any): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/grid${StringHelper.queryString(search)}`, data);
  }

  public getUserProfile(userId: number): Observable<any> {
    return this.api.get<CreateUserRequest>(`${this.endpoint}/profile/${userId}`);
  }

  public saveUserProfile(userProfile: UserProfileDetails): Observable<any> {
    return this.api.put<UserProfileDetails>(`${this.endpoint}/profile`, userProfile);
  }

  public createUser(newUser: CreateUserRequest): Observable<User> {
    return this.api.post<CreateUserRequest>(`${this.endpoint}/register/multiple-roles`, newUser);
  }

  public getUserSettings(userId: string): Observable<any> {
    const requestParams = { userId };

    return this.api.get(`${this.endpoint}/settings${StringHelper.queryString(requestParams)}`);
  }

  public updateUserProfileSettings(userSettings: any): Observable<any> {
    return this.api.post(`${this.endpoint}/save-settings`, userSettings);
  }

  public getCountriesPhoneCodes(): Observable<any[]> {
    return this.api.get(`${this.countriesEndpoint}/countriesPhoneCodes`);
  }

  public resendActivationEmail(userId: number) {
    return this.api.post<AccessPolicy[]>(`${this.endpoint}/register/resend/${userId}`, null);
  }

  public unlock(request: UnlockUserRequest): Observable<User> {
    return this.api.post<UnlockUserRequest>(`${this.endpoint}/unlock`, request);
  }

  public getActionsLog(userGuid: string, data: IServerSideGetRowsRequestExtended): Observable<any> {
    const params = { userId: userGuid };
    return this.api.post<any>(`${this.endpoint}/login-history${StringHelper.queryString(params)}`, data);
  }

  public sendMfaCode(userSub: string): Observable<boolean> {
    return this.api.get(`${this.endpoint}/${userSub}/sms`);
  }

  public deleteMfa(userId: string) {
    return this.api.delete(`${this.endpoint}/mfa/${userId}`);
  }

  public createAuthy(request: AuthyUpdateRequest): Observable<number> {
    return this.api.post(`${this.endpoint}/settings/new-authy`, request);
  }

  public getRoles(userId: number): Observable<OrganizationRoleUser[]> {
    return this.api.get<OrganizationRoleUser[]>(`${this.endpoint}/${userId}/roles`);
  }

  public searchUsersOptions(searchTerm: string): Observable<IdValue[]> {
    return this.api.get<IdValue[]>(`${this.endpoint}/users-light?searchTerm=${searchTerm}`);
  }

  public exportInternal(): Observable<File> {
    return this.api.exportSearch(`${this.endpoint}/export-internal`, null);
  }

  public exportUserLoginReport(request: UserLoginReportRequest): Observable<SaveDocumentGeneratorRequest> {
    return this.api.post(`${this.usersAuditEndpoint}/generate`, request);
  }

  public getOrganizationRolesForUserCreation(orgId: number): Observable<OrganizationRole[]> {
    return this.api.get<OrganizationRole[]>(`${this.endpoint}/organization-roles/${orgId}`, null);
  }
}
