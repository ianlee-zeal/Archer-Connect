import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { mergeMap, switchMap, catchError, tap, withLatestFrom } from 'rxjs/operators';

import { ClaimSettlementLedgerSettingsService, ModalService } from '@app/services';
import { DocumentGenerationService } from '@app/services/api/documents/document-generation.service';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { SharedDocumentGenerationState } from './reducer';
import { documentGenerationSelectors } from './selectors';
import { DocumentGenerationModalComponent } from '../../document-generation-modal/document-generation-modal.component';

import * as actions from './actions';

@Injectable()
export class DocumentGenerationEffects {
  constructor(
    private readonly documentGenerationService: DocumentGenerationService,
    private readonly modalService: ModalService,
    private readonly actions$: Actions,
    private readonly store: Store<SharedDocumentGenerationState>,
    private readonly claimSettlementLedgerSettingsService: ClaimSettlementLedgerSettingsService,
  ) { }


  loadDefaultData$ = createEffect(() => this.actions$.pipe(
    ofType(actions.LoadDefaultData),
    withLatestFrom(this.store.select(documentGenerationSelectors.root)),
    mergeMap(([,state]) => this.documentGenerationService.getTemplates(state.templateTypes, state.entityTypeId, state.documentTypes, state.entityId).pipe(
      switchMap(data => [
        actions.LoadDefaultDataComplete({ data }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));


  openDocumentGenerationModal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.OpenDocumentGenerationModal),
    tap(() => {
      this.modalService.show(DocumentGenerationModalComponent, { class: 'modal-lg' });
    }),
  ), { dispatch: false });


  generateDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GenerateDocuments),
    withLatestFrom(this.store.select(documentGenerationSelectors.root)),
    mergeMap(([action, state]) => this.documentGenerationService.generate(state.controller, SaveDocumentGeneratorRequest.toSaveDocumentGeneratorRequestDto(action.channelName, state), state.entityId).pipe(
      switchMap(data => [actions.GenerateDocumentsComplete({ data })]),
      catchError(error => of(actions.Error({ error })))
    )),
  ));


  downloadResults$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadResults),
    withLatestFrom(this.store.select(documentGenerationSelectors.root)),
    mergeMap(([, state]) => this.documentGenerationService.getLatestExports(state.id).pipe(
      switchMap(() => [
        actions.DownloadResultsComplete(),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));
}
