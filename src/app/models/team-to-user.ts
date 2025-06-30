/* eslint-disable import/no-cycle */
import { Status } from './status';
import { Auditable } from './auditable';
import { Team } from './team';
import { User } from './user';
import { StatusEnum } from './enums';

export class TeamToUserDto {
  id: number;
  teamId: number;
  statusId: number;
  isManager: boolean;
  deleted: boolean;
  userId: number;
  reassign: boolean;
  teamManagerExists?: boolean;
}

export class TeamToUser extends Auditable {
  id: number;
  teamId: number;
  team: Team;
  userId: number;
  user: User;
  statusId: number;
  status: Status;
  isManager: boolean;
  deleted: boolean;
  isActive: boolean;

  constructor(model?: Partial<TeamToUser>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item): TeamToUser {
    if (!item) {
      return null;
    }

    return {
      ...super.toModel(item),
      id: item.id,
      teamId: item.teamId,
      team: item.team,
      userId: item.userId,
      user: User.toModel(item.user),
      statusId: item.statusId,
      status: Status.toModel(item.status),
      isManager: item.isManager,
      deleted: item.deleted,
      isActive: item.statusId === StatusEnum.TeamMemberActive,
    } as TeamToUser;
  }

  public static toDto(item: TeamToUser, reassign: boolean): TeamToUserDto {
    return {
      id: item.id,
      teamId: item.teamId,
      statusId: item.isActive ? StatusEnum.TeamMemberActive : StatusEnum.TeamMemberInactive,
      isManager: item.isManager,
      deleted: item.deleted,
      userId: item.userId,
      reassign,
    };
  }
}
