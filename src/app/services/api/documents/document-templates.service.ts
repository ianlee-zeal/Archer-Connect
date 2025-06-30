import { Injectable } from '@angular/core';
import { DocumentTemplate } from '@app/models/documents/document-generators/document-template';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Observable } from 'rxjs';
import { Page } from '@app/models/page';
import { IdValue } from '@app/models';
import { CreateOrUpdateTemplateRequest } from '@app/models/documents/document-generators';
import * as enums from '../../../models/enums';
import { RestService } from '../_rest.service';
import { TestCSGenerationRequest } from '@app/models/docusign-sender/test-cs-generation-request';
import { DocuSignCSResponse } from '@app/models/docusign-sender/docusign-cs-response';
import { EmailDefaults } from '@app/models/docusign-sender/email-defaults';
import { SearchOptionsHelper } from '@app/helpers'
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Injectable({ providedIn: 'root' })
export class DocumentTemplatesService extends RestService<DocumentTemplate> {
  endpoint = enums.ControllerEndpoints.DocumentTemplates;

  public search(gridParams: IServerSideGetRowsParamsExtended): Observable<Page<any>> {
    return super.search({ ...gridParams.request });
  }

  public getDocumentTypesForTemplates(): Observable<DocumentType[]> {
    return this.api.get(`${enums.ControllerEndpoints.DocumentTypes}/templates`);
  }

  public getDocumentTemplatesDropdownValues(filter: string, entityType: enums.EntityTypeEnum, documentType: enums.DocumentType): Observable<IdValue[]> {
    const searchOptions = {} as IServerSideGetRowsRequestExtended;
    searchOptions.startRow = 0;
    searchOptions.endRow = 10;
    searchOptions.filterModel = [
      new FilterModel({ key: 'entityTypeId', filter: entityType, filterType: 'Number', type: 'Equals' }),
      new FilterModel({ key: 'document.documentTypeId', filter: documentType, filterType: 'Number', type: 'Equals' }),
      new FilterModel({ key: 'name', filter, filterType: 'Text', type: 'Contains' }),
    ];
    return this.api.post(`${this.endpoint}/dropdownValues`, searchOptions);
  }

  public getDocuSignIntegrationTemplatesDropdownValues(documentType: enums.DocumentType): Observable<IdValue[]> {
    const searchOptions = {} as IServerSideGetRowsRequestExtended;
    searchOptions.startRow = 0;
    searchOptions.endRow = 50;
    searchOptions.filterModel = [
      SearchOptionsHelper.getNumberFilter('document.documentTypeId', 'number', 'equals', documentType),
      SearchOptionsHelper.getNumberFilter('document.statusId', 'number', 'equals', enums.ClosingStatementDocumentStatusEnum.Published),
    ];
    return this.api.post(`${this.endpoint}/dropdownValues`, searchOptions);
  }


  public getDocumentStatuses(documentTypeId: number): Observable<IdValue[]> {
    return this.api.get(`${enums.ControllerEndpoints.DocumentStatuses}/${documentTypeId}/statuses`);
  }

  public getAllDocumentStatuses(): Observable<IdValue[]> {
    return this.api.get(`${enums.ControllerEndpoints.DocumentStatuses}/statuses`);
  }

  public csSampleGeneration(request: TestCSGenerationRequest, templateId: number): Observable<any> {
    var path = "cs-generation";
    if(templateId != null) path += `/${templateId}`;
    path += "/sample";
    return this.api.exportSearch(`${enums.ControllerEndpoints.DocumentTemplates}/${path}`, request);
  }

  public testDITFile(templateId: number, request: TestCSGenerationRequest): Observable<DocuSignCSResponse> {
    return this.api.post(`${enums.ControllerEndpoints.DocumentTemplates}/cs-generation/${templateId}`, request);
  }

  public testDITFileFromCreate(request: TestCSGenerationRequest): Observable<DocuSignCSResponse> {
    return this.api.post(`${enums.ControllerEndpoints.DocumentTemplates}/cs-generation`, request);
  }

  public getDocusignTemplateDefaults(): Observable<EmailDefaults> {
    return this.api.get(`${enums.ControllerEndpoints.DocumentTemplates}/docusignDefaults`);
  }

  public create(request: CreateOrUpdateTemplateRequest) {
    return this.api.postWithFile(this.endpoint, request, request.file);
  }

  public update(request: CreateOrUpdateTemplateRequest) {
    return this.api.putWithFile(`${this.endpoint}/${request.id}`, request, request.file);
  }

  public searchDocumentTemplateOptions(params: IServerSideGetRowsRequestExtended): Observable<IdValue[]> {
    return this.api.post(`${this.endpoint}/dropdownValues`, params);
  }

  public getTemplateById(templateId: number): Observable<DocumentTemplate> {
    return this.api.get(`${enums.ControllerEndpoints.Templates}/${templateId}`);
  }
}
