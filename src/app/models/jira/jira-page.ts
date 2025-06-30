import { JiraIssue } from "./jira-issue";

export class ListMessagesResponse {
    messages: JiraIssue[];
    nextPageToken: string;
}