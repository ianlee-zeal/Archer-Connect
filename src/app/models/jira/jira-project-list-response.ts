import { IdNamePair } from '@app/models/jira/id-name-pair';

export class JiraProjectListResponse {
  items: IdNamePair[];
  nextPageToken: string;
}