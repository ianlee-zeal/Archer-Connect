import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TaskWidgetRequest, TaskWidget } from '@app/models';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class WidgetService extends RestService<any> {
  endpoint = '/task-widgets';

  public getTaskWidgets(taskWidgetRequest: TaskWidgetRequest):Observable<TaskWidget[]> {
    return this.api.post<TaskWidgetRequest>(`${this.endpoint}/widgets`, taskWidgetRequest);
  }
}
