import { Injectable } from '@angular/core';
import { Page } from '@app/models/page';
import { Observable } from 'rxjs';

import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { IDeficiencySettingsTemplateUpdate } from '@app/models/deficiencies/deficiency-settings-template-update';
import { DeficiencySettingsConfig } from '@app/models/deficiencies/deficiency-settings-config';
import { RestService } from './_rest.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Injectable({ providedIn: 'root' })
export class DeficiencySettingsService extends RestService<any> {
  endpoint = '/deficiency-settings';

  public searchProjectDeficienciesTemplates(projectId: number, search: IServerSideGetRowsRequestExtended = null): Observable<Page<DeficiencySettingsTemplate>> {
    return this.api.post<IServerSideGetRowsRequestExtended>(`${this.endpoint}/templates/${projectId}/search`, search);
  }

  public setDefaultTemplate(projectId: number, templateId: number): Observable<any> {
    return this.api.put(`${this.endpoint}/templates/${projectId}/setDefault/${templateId}`, null);
  }

  public getDeficiencyTemplate(templateId: number, projectId: number): Observable<DeficiencySettingsTemplate> {
    return this.api.get(`${this.endpoint}/templates/${projectId}/template/${templateId}`);
  }

  public updateDeficiencyTemplate(data: IDeficiencySettingsTemplateUpdate): Observable<DeficiencySettingsTemplate> {
    return this.api.put(`${this.endpoint}/templates`, data);
  }

  public createDeficiencyTemplate(data: IDeficiencySettingsTemplateUpdate): Observable<DeficiencySettingsTemplate> {
    return this.api.post(`${this.endpoint}/templates`, data);
  }

  public getDeficiencySettings(projectId: number): Observable<DeficiencySettingsConfig[]> {
    return this.api.get(`${this.endpoint}/${projectId}`);
  }

  public updateDeficiencySettings(projectId: number, data: DeficiencySettingsConfig[]): Observable<Page<any>> {
    return this.api.put(`${this.endpoint}/${projectId}`, data.map((config: DeficiencySettingsConfig) => DeficiencySettingsConfig.toDto(config)));
  }
}
