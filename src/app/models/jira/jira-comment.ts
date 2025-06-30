import { JiraUser } from '@app/models/jira/jira-user';
import { DateHelper } from '@app/helpers';

export class JiraComment {
  id: string;
  description: string;
  creator: JiraUser;
  createdAt: Date;

  public static toModel(item): JiraComment {
    return {
      id: item.id,
      description: item.description,
      creator: item.creator,
      createdAt: DateHelper.toLocalDate(item.createdAt),
    };
  }
}