import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IntegrationDto } from '@app/models/lien-deficiencies/integrationDto';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class LienDeficienciesService extends RestService<any> {
  endpoint = '/integrations';
  deficiencySettingsEndoint = '/deficiency-settings';
  deficiencyCategoryEndpoint = '/deficiency-category'

  search(search = null): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/search`, search);
  }

  searchDeficienciesManagement(search = null): Observable<any> {
    return this.api.post<any>(`${this.deficiencySettingsEndoint}/type/search`, search);
  }

  changeStatus(id: number, status: boolean): Observable<any> {
    return this.api.put<any>(`${this.deficiencySettingsEndoint}/type/${id}`, { active: status });
  }

  create(integrationDto: IntegrationDto): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/create`, integrationDto);
  }

  getDeficiencyCategories(): Observable<any> {
    return this.api.get<any>(`${this.deficiencyCategoryEndpoint}/light`);
  }

  public downloadDocument(jobId: number): Observable<File> {
    return this.api.getFile(`${this.endpoint}/integrations-job/${jobId}/results-document`);
  }
}
