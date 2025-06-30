import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  mergeMap,
  switchMap,
  tap,
  catchError,
  withLatestFrom,
} from 'rxjs/operators';

import { AuditorService, DocumentImportsService } from '@app/services';
import { Store } from '@ngrx/store';

import { AuditorState } from '@app/modules/auditor/state/reducer';
import { auditorSelector } from '@app/modules/auditor/state/selectors';

import { AuditDocImportTemplate } from '@app/models/auditor/audit-doc-import-template';
import { DocumentImport } from '@app/models/documents';
import { AuditRun } from '@app/models/auditor/audit-run';
import { AuditResultPreview } from '@app/models/auditor/audit-result-preview';
import { AuditResultCounts } from '@app/models/auditor/audit-result-counts';
import { AuditValidationResults } from '@app/models/auditor/audit-validation-results';
import * as actions from './actions';

@Injectable()
export class AuditBatchModalEffects {
  constructor(
    private readonly auditorService: AuditorService,
    private documentImportsService: DocumentImportsService,
    private readonly actions$: Actions,
    private readonly store$: Store<AuditorState>,
  ) { }

  getDropdownValues$ = createEffect(() => this.actions$.pipe(ofType(actions.GetDropdownValues),
    withLatestFrom(this.store$.select(auditorSelector.auditBatches)),
    mergeMap(([action, auditBatches]) => this.auditorService.getTemplates(action.searchOptions)
      .pipe(
        switchMap(response => {
          const templates = response?.items.map(item => AuditDocImportTemplate.toModel(item));

          return [
            actions.GetDropdownValuesSuccess({ collectors: auditBatches.grid.collectorOptions, templates }),
          ];
        }),
        catchError(error => of(actions.Error({ error }))),
      ))));

  auditRunCreate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateAuditRun),
    mergeMap(action => this.auditorService.runAudit(action.auditRunCreation)
      .pipe(
        switchMap((auditRun: AuditRun) => [
          actions.CreateAuditRunSuccess({ auditRun }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  validateAuditDocument$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.ValidateAuditDocument),
    mergeMap(action => this.documentImportsService
      .createBulkDocument(
        DocumentImport.toDto(action.documentImport),
        action.file,
      )
      .pipe(
        switchMap((documentImport: DocumentImport) => [
          actions.ValidateAuditDocumentSuccess({ documentImport: DocumentImport.toModel(documentImport) }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  runAuditor$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RunAuditor),
    mergeMap(action => this.auditorService.runAuditor(action.runAuditorCommand, !!action.approve)
      .pipe(
        switchMap((auditRun: AuditRun) => [
          actions.RunAuditorSuccess({ auditRun }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getAuditResultsCounts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ShowAuditResults),
    mergeMap(action => this.auditorService.getAuditResultsCounts(action.auditRun.id)
      .pipe(
        switchMap((counts: AuditResultCounts) => [
          actions.ShowAuditResultsSuccess({ auditRun: action.auditRun, counts }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getAuditValidationResults$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetAuditValidationResults),
    mergeMap(action => {
      const agGridParams = action.agGridParams;

      return this.auditorService.getAuditResults(
        agGridParams ? agGridParams.request : null,
      )
        .pipe(
          switchMap(response => {
            const result = { ...response };
            return [
              actions.GetAuditValidationResultsSuccess({
                auditValidationResults: AuditValidationResults.toModel(result),
                totalRecordsCount: result.totalRecordsCount,
                tab: action.tab,
                agGridParams,
              }),
            ];
          }),
          catchError(error => of(actions.Error({ error }))),
        );
    }),
  ));

  getBatchActionResultRequestSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAuditValidationResultsSuccess),
    tap(action => {
      const gridRows: AuditResultPreview[] = action.auditValidationResults.items;
      const rowsCount = action.totalRecordsCount;

      action.agGridParams.success({ rowData: gridRows, rowCount: rowsCount});
    }),
  ), { dispatch: false });
}
