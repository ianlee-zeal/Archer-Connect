import { JiraStatus } from '@app/models/jira/jira-status';
import { JiraProject } from '@app/models/jira/jira-project';
import { JiraRequestType } from '@app/models/jira/jira-request-type';
import { JiraUser } from '@app/models/jira/jira-user';
import { DateHelper } from '@app/helpers';

export class JiraIssue {
  id: string;
  summary: string;
  ticketKey: string;
  project: JiraProject;
  status: JiraStatus;
  requestType: JiraRequestType;
  description: string;
  descriptionHtml: string;
  reporter: JiraUser;
  assignee: JiraUser;
  participants: JiraUser[];
  createdAt: Date;
  lastUpdatedAt: Date;
  attachments: { id: string; fileName: string }[];

  public static toModel(item): JiraIssue {
    return {
      id: item.id,
      summary: item.summary,
      ticketKey: item.ticketKey,
      project: item.project,
      status: item.status,
      requestType: item.requestType,
      description: item.description,
      descriptionHtml: item.descriptionHtml,
      reporter: item.reporter,
      assignee: item.assignee,
      participants: item.participants,
      createdAt: DateHelper.toLocalDate(item.createdAt),
      lastUpdatedAt: DateHelper.toLocalDate(item.lastUpdatedAt),
      attachments: item.attachments ?? [],
    };
  }
}

