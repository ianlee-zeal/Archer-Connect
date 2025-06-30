import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RestService } from "./_rest.service";
import { JiraSearchOptions } from "@app/models/jira/jira-search-options";
import { JiraComment } from "@app/models/jira/jira-comment";
import { HttpContext, HttpParams } from '@angular/common/http';
import { JiraIssue } from "@app/models/jira/jira-issue";
import { BYPASS_SPINNER } from '@app/tokens/http-context-tokens';

@Injectable({providedIn: 'root'})
export class CommunicationHubService extends RestService<any> {
  endpoint = '/communication-hub';

  public getMessages(data: JiraSearchOptions): Observable<any> {
    return this.api.post(`${this.endpoint}/search`, data);
  }

  public getMessage(ticketKey: string): Observable<any> {
    return this.api.get<JiraIssue>(`${this.endpoint}/message/${ticketKey}`);
  }

  public getStatuses(): Observable<any> {
    return this.api.get<string[]>(`${this.endpoint}/statuses`);
  }

  public getRequestTypes(): Observable<any> {
    return this.api.get<string[]>(`${this.endpoint}/request-types`);
  }

  public getMessageComments(ticketKey: string): Observable<any> {
    return this.api.get<JiraComment[]>(`${this.endpoint}/comments/${ticketKey}`);
  }

  public downloadAttachment(attachmentId: number): Observable<any> {
    return this.api.getFile(`${this.endpoint}/attachment/${attachmentId}`);
  }

  public getJiraRequestTypeFields(requestTypeId: number): Observable<any> {
    return this.api.get(`${this.endpoint}/request-type/${requestTypeId}/fields`);
  }

  public createJiraReply(data: any): Observable<any> {
    return this.api.post(`${this.endpoint}/comments/reply/`, data);
  }

  public getParticipants(searchTerm: string): Observable<any> {
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this.api.get(`${this.endpoint}/participants`, searchTerm ? params : null);
  }

  public getProjectAgents(): Observable<any> {
    return this.api.get(`${this.endpoint}/project-agents`);
  }

  public getUnresolvedCount(userId: number): Observable<any> {
    return this.api.get(`${this.endpoint}/messages/${userId}/unresolved/count`);
  }

  public getResponseNeededCount(userId: number): Observable<any> {
    return this.api.get(`${this.endpoint}/messages/${userId}/response-needed/count`);
  }

  public getAvailableJiraProjects(data: JiraSearchOptions): Observable<any> {
    const context = new HttpContext().set(BYPASS_SPINNER, true);
    return this.api.post(`${this.endpoint}/project/search`, data, context);
  }

  public uploadJiraFile(file: File) {
    const formData = new FormData();
    formData.append('files', file);

    const context = new HttpContext().set(BYPASS_SPINNER, true);
    return this.api.postFormDataWithProgress(`${this.endpoint}/attachment/upload`, formData, context);
  }
}