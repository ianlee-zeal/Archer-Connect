import { Injectable } from '@angular/core';
import { IExportRequest } from '@app/models/export-request';
import { TaskRequest } from '@app/models/task-request';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class TasksService extends RestService<any> {
  endpoint = '/tasks';

  updateTask(data: TaskRequest): Observable<TaskRequest> {
    return this.api.put(`${this.endpoint}`, data);
  }

  getTaskCategories(): Observable<any> {
    return this.api.get(`${this.endpoint}/categories`);
  }

  getSubTaskCategories(parentCategoryId?: number): Observable<any> {
    return this.api.get(`${this.endpoint}/categories?parentId=${parentCategoryId}`);
  }

  getPriorities(): Observable<any> {
    return this.api.get(`${this.endpoint}/priorities`);
  }

  getStages(): Observable<any> {
    return this.api.get(`${this.endpoint}/stages`);
  }

  export(exportRequest: IExportRequest): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/export`, exportRequest);
  }
}
