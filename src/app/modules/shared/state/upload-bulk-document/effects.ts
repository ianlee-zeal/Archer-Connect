import { Injectable } from '@angular/core';

import { of } from 'rxjs';
import {
  catchError,
  filter,
  mergeMap,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import isString from 'lodash-es/isString';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { DocumentImport } from '@app/models/documents';
import { FileImportHelper } from '@app/helpers';
import { FileImportReviewTabs, UploadBulkDocumentStage } from '@app/models/enums';
import { ValidationResults, ValidationResultsLineItem } from '@app/models/file-imports';
import { DisbursementGroupLight } from '@app/models/disbursement-group-light';
import { ValidationResultErrorGridRow } from '@app/models/file-imports/validation-result-error-grid-row';
import { ResultDeletedGridRow } from '@app/models/file-imports/result-deleted-grid-row';
import { UploadBulkDocumentModalComponent } from '../../upload-bulk-document-modal/upload-bulk-document-modal.component';
import {
  ProjectsService,
  DocumentImportsService,
  DocumentsService,
  ModalService,
  ToastService,
  OrgsService,
} from '../../../../services';
import * as fromShared from '..';
import * as actions from './actions';
import { uploadBulkDocumentSelectors } from './selectors';

@Injectable()
export class UploadBulkDocumentEffects {
  constructor(
    private documentImportsService: DocumentImportsService,
    private documentsService: DocumentsService,
    private modalService: ModalService,
    private projectsService: ProjectsService,
    private actions$: Actions,
    private toaster: ToastService,
    private store$: Store<fromShared.AppState>,
    private orgService: OrgsService,
  ) {}

  loadDefaultData$ = createEffect(() => this.actions$.pipe(
    ofType(actions.LoadDefaultData),
    mergeMap(action => this.documentImportsService
      .getDropdownValues(action.entityType, action.entityId).pipe(
        switchMap(data => [actions.LoadDefaultDataComplete({ data })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  loadDisbursementGroupsData$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.LoadDisbursementGroupsData),
    mergeMap(action => this.projectsService.getDisbursementGroups(action.entityId, action.removeProvisionals).pipe(
      switchMap((data : DisbursementGroupLight[]) => [
        actions.LoadDisbursementGroupsDataComplete({ data: data.map(DisbursementGroupLight.toModel) }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  openUploadBulkDocumentModal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.OpenUploadBulkDocumentModal),
    tap(action => {
      const initialState = {
        entityTypeId: action.entityTypeId,
        importTypeId: action.importTypeId,
        entityId: action.entityId,
        allowedExtensions: action.allowedExtensions,
        initialStage: UploadBulkDocumentStage.Select,
        onPusherMessageReceived: action.onPusherMessageReceived,
      };

      this.modalService.show(UploadBulkDocumentModalComponent, {
        initialState,
        class: 'modal-lg wide-modal',
      });
    }),
  ), { dispatch: false });

  editUploadBulkDocumentModal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.EditUploadBulkDocumentModal),
    tap(action => {
      const initialState = {
        entityTypeId: action.entityTypeId,
        entityId: action.entityId,
        allowedExtensions: action.allowedExtensions,
        documentImport: action.documentImport,
        initialStage: FileImportHelper.getStageByStatusId(action.documentImport.job.statusId, action.documentImport),
        onPusherMessageReceived: action.onPusherMessageReceived,
      };

      this.modalService.show(UploadBulkDocumentModalComponent, {
        initialState,
        class: 'modal-lg wide-modal',
      });
    }),
  ), { dispatch: false });

  submitBulkDocumentRequest$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.SubmitBulkDocumentRequest),
    mergeMap(action => this.documentImportsService
      .createBulkDocument(
        DocumentImport.toDto(action.documentImport),
        action.file,
      )
      .pipe(
        switchMap((documentImport: DocumentImport) => [
          actions.SubmitBulkDocumentSuccess({ documentImport: DocumentImport.toModel(documentImport) }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  submitBulkDocumentSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SubmitBulkDocumentSuccess),
    tap(() => this.toaster.showSuccess('Document was submitted')),
  ), { dispatch: false });

  getDocumentImportByIdRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentImportByIdRequest),
    mergeMap(action => this.documentImportsService
      .get(action.id)
      .pipe(
        switchMap((result: DocumentImport) => [
          actions.GetDocumentImportByIdSuccess({ documentImport: DocumentImport.toModel(result) }),
        ]),
      )),
  ));

  getDocumentImportByIdSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentImportByIdSuccess),
    tap(() => this.toaster.showSuccess('Document Import retrieved')),
  ), { dispatch: false });

  getDocumentImportPreviewRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentImportPreviewRequest),
    mergeMap(action => this.documentsService
      .export(action.id)
      .pipe(
        switchMap((result: ValidationResults) => [
          actions.GetDocumentImportPreviewSuccess({ previewFileRows: ValidationResults.toPreviewModel(result) }),
        ]),
      )),
  ));

  setJobStatusRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ApproveJobRequest),
    mergeMap(action => this.documentImportsService
      .approveJob(action.id, action.channelName)
      .pipe(switchMap(() => [actions.ApproveJobSuccess()]))),
  ));

  getDownloadLog$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadLog),
    mergeMap(action => this.documentImportsService
      .get(action.id)
      .pipe(
        switchMap((result: DocumentImport) => [
          actions.DownloadDocument({ id: result.job.logDocId }),
        ]),
      )),
  ));

  downloadFiles$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadFiles),
    mergeMap(action => this.documentImportsService
      .downloadRelatedFiles(action.id)
      .pipe(
        switchMap(() => [actions.DownloadDocumentComplete()]),
        catchError(() => of(actions.DownloadDocumentError())),
      )),
  ));

  openDocument$ = createEffect(() => this.actions$.pipe(
    ofType(actions.OpenDocument),
    mergeMap(action => this.documentsService.openDocument(action.id).pipe(
      switchMap(() => [actions.DownloadDocumentComplete()]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  downloadDocument$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadDocument),
    mergeMap(action => this.documentsService.downloadDocument(action.id).pipe(
      switchMap(() => [actions.DownloadDocumentComplete()]),
      catchError(() => of(actions.DownloadDocumentError())),
    )),
  ));

  downloadDocumentError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadDocumentError),
    tap(() => this.toaster.showError('Document was not found.')),
  ), { dispatch: false });

  downloadTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadTemplate),
    mergeMap(action => this.documentImportsService.downloadTemplate(action.id, action.fileName).pipe(
      switchMap(() => [actions.DownloadTemplateSuccess()]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  downloadRelatedTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadRelatedTemplate),
    mergeMap(action => this.documentImportsService.downloadRelatedTemplate(action.id, action.projectId, action.fileName).pipe(
      switchMap(() => [actions.DownloadRelatedTemplateSuccess()]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getDocumentImportsResultRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentImportsResultRequest),
    withLatestFrom(this.store$.select(uploadBulkDocumentSelectors.reviewGrids)),
    mergeMap(([action, reviewGrids]) => {
      const agGridParams = action.agGridParams
        ? action.agGridParams
        : reviewGrids[action.tab].agGridParams;

      return this.documentImportsService.getDocumentImportsResult(
        action.entityId,
        action.documentTypeId,
        agGridParams ? agGridParams.request : null,
        action.status,
      )
        .pipe(
          withLatestFrom(
            this.store$.select(uploadBulkDocumentSelectors.documentImport),
            this.store$.select(uploadBulkDocumentSelectors.disbursementGroups),
          ),
          switchMap(([response, document, disbursementGroups]) => {
            let result = { ...response };
            if (document?.config?.groupId) {
              const id = document.config?.groupId;
              const groupName = disbursementGroups?.find(group => group.id === id).name;
              const updatedFields = response?.rows?.map(row => ({ ...row, fields: { ...row.fields, GroupId: id, GroupName: groupName } }));
              result = { ...result, rows: [...updatedFields] };
            } return [
              actions.GetDocumentImportsResultSuccess({
                validationResults: ValidationResults.toModel(result),
                tab: action.tab,
                agGridParams,
              }),
            ];
          }),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  GetDocumentImportsResultComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDocumentImportsResultSuccess),
    tap(action => {
      let gridRows: ValidationResultsLineItem[] | ValidationResultErrorGridRow[] | ResultDeletedGridRow[] = action.validationResults.rows;

      if (action.tab === FileImportReviewTabs.Errors || action.tab === FileImportReviewTabs.Warnings) {
        gridRows = ValidationResultErrorGridRow.toFlattenedArrayOfModels(action.validationResults.rows);
      } else if (action.tab === FileImportReviewTabs.Deleted) {
        gridRows = action.validationResults.deletedList as ResultDeletedGridRow[];
      }

      const rowsCount = ValidationResults.getCount(action.validationResults, action.tab);
      action.agGridParams.success({ rowData: gridRows, rowCount: rowsCount});
    }),
  ), { dispatch: false });

  getProjectFirmsOptions$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectFirmsOptions),
    mergeMap(action => this.orgService.getProjectFirmsOptions(action.projectId).pipe(
      switchMap(response => [
        actions.GetProjectFirmsOptionsSuccess({ options: response }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  reviewJobRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ReviewJobRequest),
    mergeMap(action => this.documentImportsService
      .reviewJob(action.id, action.channelName)
      .pipe(switchMap(() => [actions.ReviewJobSuccess()]))),
  ));

  uploadAdditionalDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UploadAdditionalDocuments),
    mergeMap(action => this.documentImportsService.uploadAdditionalFiles(action.documentImportId, action.files)
      .pipe(
        switchMap(() => [actions.UploadAdditionalDocumentsSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      ))
  ));

  updatePaymentDetail$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdatePaymentDetail),
    mergeMap(action => this.documentImportsService.updatePaymentRequestItem(action.documentImportId, action.paymentRequestItemId, action.item)
      .pipe(
        switchMap(() => [actions.UpdatePaymentDetailSuccess()]),
        catchError(error => of(actions.Error({ error }))),
      ))
  ));

  updateDocumentImport$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateDocumentImport),
    mergeMap(action => this.documentImportsService
      .get(action.id)
      .pipe(
        switchMap((result: DocumentImport) => [
          actions.UpdateDocumentImportSuccess({ documentImport: DocumentImport.toModel(result) }),
        ]),
      )),
  ));

  documentImportGetTotalPayment$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DocumentImportGetTotalPayment),
    mergeMap(action => this.documentImportsService
      .getTotalPayment(action.id)
      .pipe(
        switchMap((totalPayment: number) => [
          actions.DocumentImportGetTotalPaymentSuccess({ totalPayment }),
        ]),
      )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    filter(action => isString(action.error)),
    tap(data => {
      this.toaster.showError(data.error);
    }),
  ), { dispatch: false });
}
