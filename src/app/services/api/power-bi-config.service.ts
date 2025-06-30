import { Injectable } from '@angular/core';
import { RestService } from './_rest.service';
import { Observable } from 'rxjs';
import { PowerBiConfigModel, PowerBiProjectPermissionsResponse } from '../power-bi-config.model';

@Injectable({
  providedIn: 'root',
})
export class PowerBiConfigService extends RestService<any> {

  endpoint = '/power-bi';

  getEmbeddedReportConfig(projectId?: number): Observable<PowerBiConfigModel> {

    return this.api.get<Observable<PowerBiConfigModel>>(`${this.endpoint}/embed-info?projectId=${projectId}`);

  }

  getPermissionActionTypes(): Observable<PowerBiProjectPermissionsResponse> {

    return this.api.get<Observable<PowerBiProjectPermissionsResponse>>(`${this.endpoint}/permission-action-types`);
  }

  getEmbeddedReportSettings(reportConfigEndpoint: string, projectId?: number): Observable<PowerBiConfigModel> {
    let url = `${this.endpoint}/${reportConfigEndpoint}`;
    if (projectId !== undefined) {
      url += `?projectId=${projectId}`;
    }
    return this.api.get<Observable<PowerBiConfigModel>>(url);
  }
}
