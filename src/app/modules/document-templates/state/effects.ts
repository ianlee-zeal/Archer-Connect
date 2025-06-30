import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { mergeMap, catchError, switchMap, tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { DocumentTemplatesService } from '@app/services/api/documents/document-templates.service';
import { ToastService } from '@app/services/toast-service';

import { DocumentTemplate } from '@app/models/documents/document-generators/document-template';
import { IdValue } from '@app/models';
import * as actions from './actions';
import { HttpHeaders } from '@angular/common/http';
import { DocuSignCSResponse } from '@app/models/docusign-sender/docusign-cs-response';
import { EmailDefaults } from '@app/models/docusign-sender/email-defaults';
import { DocuSignMessage } from '@app/models/enums/docusign-sender/docusign-message.enum';

@Injectable()
export class DocumentTemplatesEffects {

  private headers = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(
    private readonly documentTemplatesService: DocumentTemplatesService,
    private readonly actions$: Actions,
    private readonly toastService: ToastService,
  ) { }


  readonly getDocumentTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentTemplates),
    mergeMap(action => this.documentTemplatesService.search(action.gridParams)
      .pipe(switchMap(response => [
        actions.GetDocumentTemplatesSuccess({
          documentTemplates: response.items.map(DocumentTemplate.toModel),
          gridParams: action.gridParams,
          totalRecords: response.totalRecordsCount,
        }),
      ]),
      catchError(error => of(actions.Error({ error }))))),
  ));


  readonly getDocumentTemplatesSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentTemplatesSuccess),
    tap(action => {
      action.gridParams?.success({ rowData: action.documentTemplates, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });


  readonly getDocumentTypesForTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentTypesForTemplates),
    mergeMap(() => this.documentTemplatesService.getDocumentTypesForTemplates()
      .pipe(switchMap((documentTypes: DocumentType[]) => [
        actions.GetDocumentTypesForTemplatesSuccess({ documentTypes }),
      ]),
      catchError(error => of(actions.Error({ error }))))),
  ));


  readonly getDocumentStatusesForDocumentTypes$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentStatusesForDocumentType),
    mergeMap(action => this.documentTemplatesService.getDocumentStatuses(action.documentTypeId)
      .pipe(switchMap((documentStatuses: IdValue[]) => [
        actions.GetDocumentStatusesForDocumentTypeSuccess({ documentStatuses }),
      ]),
      catchError(error => of(actions.Error({ error }))))),
  ));


  readonly getDocumentStatuses$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentStatuses),
    mergeMap(() => this.documentTemplatesService.getAllDocumentStatuses()
      .pipe(switchMap((allDocumentStatuses: IdValue[]) => [
        actions.GetDocumentStatusesSuccess({ allDocumentStatuses }),
      ]),
      catchError(error => of(actions.Error({ error }))))),
  ));


  readonly deleteDocumentTemplate$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DeleteDocumentTemplate),
    mergeMap(action => this.documentTemplatesService.delete(action.templateId)
      .pipe(switchMap(() => {
        this.toastService.showSuccess('Document template deleted successfully');
        return [
          actions.GetDocumentTemplates({ gridParams: action.gridParams }),
          actions.DeleteDocumentTemplateSuccess(),
        ];
      }),
      catchError(error => of(actions.Error({ error }))))),
  ));

  readonly createDocumentTemplate$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.CreateDocumentTemplate),
    mergeMap(action => this.documentTemplatesService.create(action.request)
      .pipe(switchMap(() => {
        this.toastService.showSuccess('Document template successfully created.');
        return [
          actions.GetDocumentTemplates({ gridParams: action.gridParams }),
          actions.CreateOrUpdateTemplateRequestSuccess(),
        ];
      }),
      catchError(error => of(actions.Error({ error }))))),
  ));


  readonly updateDocumentTemplate$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.UpdateDocumentTemplate),
    mergeMap(action => this.documentTemplatesService.update(action.request)
      .pipe(switchMap(() => {
        this.toastService.showSuccess('Document template successfully updated.');
        return [
          actions.GetDocumentTemplates({ gridParams: action.gridParams }),
          actions.CreateOrUpdateTemplateRequestSuccess(),
        ];
      }),
      catchError(error => of(actions.Error({ error }))))),
  ));


  readonly getDocumentTemplatesDropdownValues$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentTemplatesDropdownValues),
    mergeMap(action => this.documentTemplatesService.getDocumentTemplatesDropdownValues(action.filter, action.entityType, action.documentType)
      .pipe(switchMap((documentTypes: IdValue[]) => [
        actions.GetDocumentTemplatesDropdownValuesSuccess({ documentType: action.documentType, items: documentTypes }),
      ]),
      catchError(error => of(actions.Error({ error }))))),
  ));

  readonly getDocuSignIntegrationTemplatesDropdownValues$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocuSignIntegrationTemplatesDropdownValues),
    mergeMap(action => this.documentTemplatesService.getDocuSignIntegrationTemplatesDropdownValues(action.documentType)
      .pipe(switchMap((documentTypes: IdValue[]) => [
        actions.GetDocuSignIntegrationTemplatesDropdownValuesSuccess({ documentType: action.documentType, items: documentTypes }),
      ]),
      catchError(error => of(actions.Error({ error }))))),
  ));


  readonly searchDocumentTemplateOptions$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchDocumentTemplateOptions),
    mergeMap(action => this.documentTemplatesService.searchDocumentTemplateOptions(action.params)
      .pipe(switchMap((documentTypes: IdValue[]) => [
        actions.GetDocumentTemplatesDropdownValuesSuccess({ documentType: action.documentType, items: documentTypes }),
      ]),
      catchError(error => of(actions.Error({ error }))))),
  ));

  readonly testDITFile$ = createEffect(() => this.actions$.pipe(
    ofType(actions.TestDITFile),
    mergeMap(action => this.documentTemplatesService.testDITFile(action.templateId, action.request)
      .pipe(switchMap((docusignResponse: DocuSignCSResponse) => {
        if(docusignResponse && docusignResponse.hasError === false && docusignResponse.docuSignMessage === DocuSignMessage.PDFGenerated)
        {
          this.toastService.showSuccess('Closing Statement PDF was generated successfully');
        }
        else if(docusignResponse && docusignResponse.hasError === false && docusignResponse.docuSignMessage === null)
        {
          this.toastService.showSuccess('Test Electronic Delivery executed successfully. Email was sent to test recipient(s).');
        }
        else if(docusignResponse && docusignResponse.hasError === false && docusignResponse.docuSignMessage === DocuSignMessage.ValidationPassed)
        {
          this.toastService.showSuccess('Validation of Closing Statement passed successfully.');
        }
        return [
          actions.GetDocumentTemplates({ gridParams: action.gridParams }),
          actions.TestDITFileSuccess({ docusignResponse}),
        ];
      }),
      catchError(error => of(actions.Error({ error }))))),
  ));

  readonly csGenerateSample$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CSGenerateSample),
    mergeMap(action => this.documentTemplatesService.csSampleGeneration(action.request, action.templateId)
    .pipe(switchMap(() => {
      return [
        actions.CSGenerateSampleSuccess(),
      ];
    }),
    catchError(error => of(actions.Error({ error }))))),
  ));

  readonly testDITFileFromCreate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.TestDITFileFromCreate),
    mergeMap(action => this.documentTemplatesService.testDITFileFromCreate(action.request)
    .pipe(switchMap((docusignResponse: DocuSignCSResponse) => {
      if(docusignResponse && docusignResponse.hasError === false && docusignResponse.docuSignMessage === DocuSignMessage.PDFGenerated)
      {
        this.toastService.showSuccess('Closing Statement PDF was generated successfully');
      }
      else if(docusignResponse && docusignResponse.hasError === false && docusignResponse.docuSignMessage === null)
      {
        this.toastService.showSuccess('Test DocuSign executed successfully. Email was sent to test recipient(s).');
      }
      else if(docusignResponse && docusignResponse.hasError === false && docusignResponse.docuSignMessage === DocuSignMessage.ValidationPassed)
      {
        this.toastService.showSuccess('Validation of Closing Statement passed successfully.');
      }
      return [
        actions.GetDocumentTemplates({ gridParams: action.gridParams }),
        actions.TestDITFileSuccess({ docusignResponse}),
      ];
    }),
    catchError(error => of(actions.Error({ error }))))),
  ));

  readonly getDocusignDefaults$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocuSignTemplateDefaults),
    mergeMap(() => this.documentTemplatesService.getDocusignTemplateDefaults()
    .pipe(switchMap((docusignTemplateDefaults: EmailDefaults) => {
      return [
        actions.GetDocuSignTemplateDefaultsSuccess({ docusignTemplateDefaults}),
      ];
    }),
    catchError(error => of(actions.Error({ error }))))),
  ));

}
