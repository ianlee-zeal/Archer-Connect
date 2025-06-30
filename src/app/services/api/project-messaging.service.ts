import { Injectable } from '@angular/core';
import { ProjectCustomMessageDto } from '@app/models/projects/project-custom-message-dto';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class ProjectMessagingService extends RestService<any> {
  endpoint = '/messages';

  createProjectOrganizationMessage(message: ProjectCustomMessageDto): Observable<any> {
    return this.api.post(`${this.endpoint}/project-custom-messages`, message);
  }

  editProjectOrganizationMessage(id: number, message: ProjectCustomMessageDto): Observable<any> {
    return this.api.put(`${this.endpoint}/project-custom-messages/${id}`, message);
  }

  getProjectMessagingSettings(projectId: number): Observable<any> {
    return this.api.get(`${this.endpoint}/project-messages/${projectId}`);
  }

  getProjectMessagesTypes(): Observable<any> {
    return this.api.get(`${this.endpoint}/project-message-types`);
  }

  saveProjectMessages(projectId: number, projectMessages: any): Observable<any> {
    return this.api.put(`${this.endpoint}/project-messages/${projectId}`, projectMessages);
  }

  getProjectCustomMessaging(projectId: number): Observable<any> {
    return this.api.get(`${this.endpoint}/custom-messages-for-project/${projectId}`);
  }

  getProjectMessagesByClientId(clientId: number): Observable<any> {
    return this.api.get(`${this.endpoint}/client-messages/${clientId}`);
  }
}
