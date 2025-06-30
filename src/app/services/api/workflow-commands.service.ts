import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Page } from '@app/models/page';
import { WorkflowCommand } from '@app/models/workflow-command';
import { WorkflowCommandFilterTypesEnum } from '@app/models/enums/workflow-command-filter-types.enum';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class WorkflowCommandsService extends RestService<any> {
  endpoint = '/workflow-command';

  public search(searchOptions: IServerSideGetRowsRequestExtended): Observable<Page<any>> {
    return this.api.post(`${this.endpoint}/list`, searchOptions);
  }

  updateWorkflowCommand(data: WorkflowCommand): Observable<WorkflowCommand> {
    const params = { ...data, id: data.id ? data.id : 0 };
    return data.id ? this.api.put(`${this.endpoint}`, data) : this.api.post(`${this.endpoint}`, params);
  }

  getWorkflowCommandsFilters(filterType: WorkflowCommandFilterTypesEnum): Observable<string[]> {
    return this.api.get(`${this.endpoint}/filter?type=${filterType}`);
  }
}
