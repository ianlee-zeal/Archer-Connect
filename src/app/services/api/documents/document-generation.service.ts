import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { StringHelper } from '@app/helpers/string.helper';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { ControllerEndpoints } from '@app/models/enums';
import { RestService } from '../_rest.service';
import { DocumentGeneratorRequest } from '@app/models/documents/document-generators/document-generator-request';

@Injectable({ providedIn: 'root' })
export class DocumentGenerationService extends RestService<any> {
  endpoint = ControllerEndpoints.DocumentGenerators;

  public getDropdownValues(templateTypes: number[], entityTypeId: number, entityId?: number): Observable<any[]> {
    const params = {
      entityTypeId,
      entityId,
      templateTypes,
    };
    return this.api.get(`${this.endpoint}/dropdownvalues${StringHelper.queryString(params)}`);
  }

  public generate(controller: ControllerEndpoints, request: SaveDocumentGeneratorRequest, id?: number): Observable<any> {
    let path = `${controller}`;
    if (id) {
      path += `/${id}/generate`;
    } else {
      path += '/generate';
    }
    return this.api.post(`${path}`, request);
  }

  // Method for calling the document generator API without the template (it will be retrieved from the server)
  public generateWithoutTemplate (controller: ControllerEndpoints, request: DocumentGeneratorRequest, id?: number): Observable<any> {
    let path = `${controller}`;
    if (id) {
      path += `/${id}/generate`;
    } else {
      path += '/generate';
    }
    return this.api.post(`${path}`, request);
  }

  public getLatestExports(id: number): Observable<any> {
    return this.api.getFile(`${this.endpoint}/${id}/latest-export`);
  }

  public getTemplates(templateTypes: number[], entityTypeId: number, documentTypes: number[], entityId?: number): Observable<any[]> {
    const params = {
      entityTypeId,
      entityId,
      templateTypes,
      documentTypes,
    };
    return this.api.get(`${this.endpoint}/templates${StringHelper.queryString(params)}`);
  }
}
