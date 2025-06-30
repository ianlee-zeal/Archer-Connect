import { Injectable } from '@angular/core';
import { ProjectReceivable } from '@app/models/projects/project-receivable/project-receivable';
import { IDictionary } from '@app/models/utils';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class ProjectReceivablesService extends RestService<any> {
  endpoint = '/receivables';

  public getProjectReceivables(projectId: number): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/project/${projectId}`);
  }

  public updateProjectReceivables(projectId: number, changedItems: IDictionary<number, boolean>): Observable<any> {
    const data = ProjectReceivable.toDto(changedItems);
    return this.api.put(`${this.endpoint}/project/${projectId}`, data);
  }

  public setProjectReceivablesToDefault(projectId: number, categoryId: number, serviceId: number): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/project/${projectId}/category/${categoryId}/service/${serviceId}/defaults`);
  }
}
