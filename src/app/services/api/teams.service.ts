import { TeamToUser, IdValue, TeamToUserDto, User } from '@app/models';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class TeamsService extends RestService<any> {
  endpoint = '/teams';

  public getUserTeams(userId: number): Observable<TeamToUser[]> {
    return this.api.get<TeamToUser[]>(`${this.endpoint}?userId=${userId}`);
  }

  public getTeams(): Observable<IdValue[]> {
    return this.api.get<TeamToUser[]>(`${this.endpoint}/list`);
  }

  public createOrUpdateUserTeam(request: TeamToUserDto): Observable<TeamToUserDto> {
    if (request.id) {
      return this.api.put<TeamToUserDto>(`${this.endpoint}/user-team`, request);
    }
    return this.api.post<TeamToUserDto>(`${this.endpoint}/user-team`, request);
  }

  public getTeamMembersForTasks(teamId?: number): Observable<User[]> {
    const url = teamId ? `${this.endpoint}/users-by-team/${teamId}` : `${this.endpoint}/users-by-team/-1`;
    return this.api.get<User[]>(url);
  }

  public getManagedTeamsByCurrentUserForTasks(): Observable<TeamToUser[]> {
    return this.api.get<TeamToUser[]>(`${this.endpoint}/managed-by-current-user`);
  }
}
