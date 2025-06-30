import { Injectable } from '@angular/core';
import { TaskRequest } from '@app/models/task-request';
import { TaskTemplate } from '@app/models/task-templates/task-template';
import { Observable } from 'rxjs';

import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class TaskTemplatesService extends RestService<any> {
  endpoint = '/task-templates';

  updateTemplate(data: TaskTemplate): Observable<TaskRequest> {
    return this.api.put(`${this.endpoint}`, data);
  }
}
