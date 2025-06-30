import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestService } from './_rest.service';
import { IDeficiencyResolution } from '@app/models/claimant-deficiency-resolution';
import { FormDataHelper } from '@app/helpers/form-data.helper';
import { IDeficiencyResolutionFile } from '@app/models/claimant-deficiency-resolution-file';

@Injectable({ providedIn: 'root' })
export class DeficiencyResolutionService extends RestService<any> {
  endpoint = '/deficiency-resolution';

  public resolveDeficiencies(deficienciesResolution: IDeficiencyResolution[], files: IDeficiencyResolutionFile[]): Observable<any> {

    const formData = FormDataHelper.objectToFormData({ deficienciesDto: deficienciesResolution }) as FormData;
    files?.forEach(doc => {
        formData.append('files', doc.file, doc.fileName);
    });
    return this.api.postFormData(`${this.endpoint}`, formData);
  }

  public getPendingDeficiencyResolutions(clientId: number): Observable<any> {
    return this.api.get(`${this.endpoint}/${clientId}/pending-resolution`);
  }
}
