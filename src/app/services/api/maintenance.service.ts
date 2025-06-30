import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Maintenance } from '@app/models/admin/maintenance';
import { RestService } from './_rest.service';
import { MaintenanceBanner } from '@app/models/admin/maintenance-banner';

@Injectable({ providedIn: 'root' })
export class MaintenanceService extends RestService<any> {
  endpoint = '/maintenance';

  public getAll(): Observable<Maintenance[]> {
    return this.api.get(`${this.endpoint}/list`);
  }

  public updateMaintenanceList(data: Maintenance[]): Observable<Maintenance[]> {
    return this.api.post(`${this.endpoint}/list`, data);
  }

  public updateBanner(data: MaintenanceBanner): Observable<MaintenanceBanner[]> {
    return this.api.put(`${this.endpoint}/banner`, data);
  }

  public updateMaintenanceOperation(maintenanceDtos: Maintenance[], maintenanceBannerDtos: MaintenanceBanner[] ): Observable<[Maintenance[], MaintenanceBanner[]]> {
    const data = { maintenanceDtos, maintenanceBannerDtos };
    return this.api.post(`${this.endpoint}/list`, data);
  }

  public getById(id: string): Observable<Maintenance> {
    return this.api.get(`${this.endpoint}/${id}`);
  }

  public getMaintenanceBannerList(): Observable<MaintenanceBanner[]> {
    return this.api.get<string>(`${this.endpoint}/banner/all`);
  }

  public getUserBanner(): Observable<string> {
    return this.api.get<string>(`${this.endpoint}/banner`);
  }

}
