import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { of, EMPTY } from 'rxjs';
import { map, catchError, tap, switchMap, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { CommunicationDirection } from '@app/models/communication-center/communication-direction';
import { CommunicationMethod } from '@app/models/communication-center/communication-method';
import { CommunicationPartyType } from '@app/models/communication-center/communication-party-type';
import { CommunicationResult } from '@app/models/communication-center/communication-result';
import { CommunicationSubject } from '@app/models/communication-center/communication-subject';
import { CommunicationRecord } from '@app/models/communication-center/communication-record';
import * as services from '@app/services';
import { Store } from '@ngrx/store';
import { SharedNotesListState } from '@app/modules/shared/state/notes-list/state';
import { notesListSelectors } from '@app/modules/shared/state/notes-list/selectors';
import * as rootActions from '@app/state/root.actions';
import * as tabInfoActions from '@app/modules/shared/state/tab-info/actions';
import * as notesListActions from 'src/app/modules/shared/state/notes-list/actions';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ProjectContactsService } from '@app/services/project-contacts.service';
import { SearchOptionsHelper } from '@app/helpers';
import { ProjectCommunicationRecord } from '@app/models/communication-center/project-communication-record';
import { ProjectContactReference } from '@app/models/project-contact-reference';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { SearchTypeEnum } from '@app/models/enums';
import * as communicationActions from './actions';

@Injectable()
export class CommunicationEffects {
  constructor(
    private communicationDirectionService: services.CommunicationDirectionService,
    private communicationMethodService: services.CommunicationMethodService,
    private communicationPartyTypeService: services.CommunicationPartyTypeService,
    private communicationResultService: services.CommunicationResultService,
    private communicationSubjectService: services.CommunicationSubjectService,
    private communicationService: services.CommunicationService,
    private projectCommunicationService: services.ProjectCommunicationService,
    private projectContactsService : ProjectContactsService,
    private toaster: services.ToastService,
    private actions$: Actions,
    private router: Router,
    private store: Store<SharedNotesListState>,
  ) { }

  getCommunicationDetailsLoadingStarted$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.GetCommunicationDetailsLoadingStarted),
    map(action => rootActions.LoadingStarted({
      actionNames: [
        communicationActions.GetCommunicationRecordRequest.type,
        communicationActions.GetCommunicationDirectionListRequest.type,
        communicationActions.GetCommunicationMethodListRequest.type,
        communicationActions.GetCommunicationPartyTypeListRequest.type,
        communicationActions.GetCommunicationResultListRequest.type,
        communicationActions.GetCommunicationSubjectListRequest.type,
        notesListActions.GetNotesList.type,
        tabInfoActions.GetTabsCount.type].concat(action.additionalActionNames || [] as any),
    })),
  ));

  getCommunicationDirections$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.GetCommunicationDirectionListRequest),
    switchMap(() => this.communicationDirectionService.index()
      .pipe(
        switchMap(response => {
          if (response) {
            const data = response.map(x => CommunicationDirection.toModel(x));
            return [communicationActions.GetCommunicationDirectionListSuccess({ communicationDirections: data }),
              rootActions.LoadingFinished({ actionName: communicationActions.GetCommunicationDirectionListRequest.type }),
            ];
          }

          return [rootActions.LoadingFinished({ actionName: communicationActions.GetCommunicationDirectionListRequest.type })];
        }),
        catchError(error => of(communicationActions.Error({ error }))),
      )),
  ));

  getCommunicationMethods$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.GetCommunicationMethodListRequest),
    switchMap(() => this.communicationMethodService.index()
      .pipe(
        switchMap(response => {
          if (response) {
            const data = response.map(x => CommunicationMethod.toModel(x));
            return [communicationActions.GetCommunicationMethodListSuccess({ communicationMethods: data }),
              rootActions.LoadingFinished({ actionName: communicationActions.GetCommunicationMethodListRequest.type })];
          }

          return [rootActions.LoadingFinished({ actionName: communicationActions.GetCommunicationMethodListRequest.type })];
        }),
        catchError(error => of(communicationActions.Error({ error }))),
      )),
  ));

  getCommunicationParties$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.GetCommunicationPartyTypeListRequest),
    switchMap(() => this.communicationPartyTypeService.index()
      .pipe(
        switchMap(response => {
          if (response) {
            const data = response.map(x => CommunicationPartyType.toModel(x));
            return [communicationActions.GetCommunicationPartyTypeListSuccess({ communicationParties: data }),
              rootActions.LoadingFinished({ actionName: communicationActions.GetCommunicationPartyTypeListRequest.type })];
          }

          return [rootActions.LoadingFinished({ actionName: communicationActions.GetCommunicationPartyTypeListRequest.type })];
        }),
        catchError(error => of(communicationActions.Error({ error }))),
      )),
  ));

  getCommunicationResultList$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.GetCommunicationResultListRequest),
    switchMap(({ directionId, methodId }) => this.communicationResultService.index({ directionId, methodId })
      .pipe(
        switchMap(response => {
          if (response) {
            const data = response.map(x => CommunicationResult.toModel(x));
            return [communicationActions.GetCommunicationResultListSuccess({ communicationResults: data }),
              rootActions.LoadingFinished({ actionName: communicationActions.GetCommunicationResultListRequest.type })];
          }

          return [rootActions.LoadingFinished({ actionName: communicationActions.GetCommunicationResultListRequest.type })];
        }),
        catchError((error: string) => of(communicationActions.Error({ error }))),
      )),
  ));

  getCommunicationSubjectList$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.GetCommunicationSubjectListRequest),
    switchMap(({ directionId, methodId }) => this.communicationSubjectService.index({ directionId, methodId })
      .pipe(
        switchMap(response => {
          if (response) {
            const data = response.map(x => CommunicationSubject.toModel(x));
            return [communicationActions.GetCommunicationSubjectListSuccess({ communicationSubjects: data }),
              rootActions.LoadingFinished({ actionName: communicationActions.GetCommunicationSubjectListRequest.type })];
          }

          return [rootActions.LoadingFinished({ actionName: communicationActions.GetCommunicationSubjectListRequest.type })];
        }),
        catchError((error: string) => of(communicationActions.Error({ error }))),
      )),
  ));

  saveCommunicationRecordRequest$ = createEffect((): any => this.actions$.pipe(
    ofType(communicationActions.SaveCommunicationRecordRequest),
    withLatestFrom(this.store.select(notesListSelectors.editableNote)),
    switchMap(([action, note]) => {
      // eslint-disable-next-line no-param-reassign
      action.communicationRecord.relatedNotes = [note];

      return this.communicationService.createCommunicationRecord(action.communicationRecord)
        .pipe(
          switchMap(response => {
            if (response) {
              const result = CommunicationRecord.toModel(response);

              if (action.callback) {
                action.callback();
              }

              return [communicationActions.SaveCommunicationRecordSuccess({
                entityId: action.entityId,
                communicationRecord: result,
                canReadNotes: action.canReadNotes,
                entity: action.entity,
              })];
            }

            return EMPTY;
          }),
          catchError((error: string) => of(communicationActions.Error({ error }))),
        );
    }),
  ));

  saveCommunicationRecordSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.SaveCommunicationRecordSuccess),
    tap(() => this.toaster.showSuccess('New Communication record was created')),
    tap(({ entityId, communicationRecord, canReadNotes, entity }) => this.navigateToCommunication(entityId, communicationRecord.id, canReadNotes, entity)),
  ), { dispatch: false });

  getCommunicationRecordRequest$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.GetCommunicationRecordRequest),
    switchMap(({ communicationRecordId }) => this.communicationService.get(communicationRecordId)
      .pipe(
        switchMap(response => {
          if (response) {
            const result = CommunicationRecord.toModel(response);
            return [communicationActions.GetCommunicationRecordSuccess({ communicationRecord: result }),
              rootActions.LoadingFinished({ actionName: communicationActions.GetCommunicationRecordRequest.type })];
          }

          return [rootActions.LoadingFinished({ actionName: communicationActions.GetCommunicationRecordRequest.type })];
        }),
        catchError((error: string) => of(communicationActions.Error({ error }))),
      )),
  ));

  updateCommunicationRecordRequest$ = createEffect((): any => this.actions$.pipe(
    ofType(communicationActions.UpdateCommunicationRecordRequest),
    switchMap(({ communicationRecord, callback }) => this.communicationService.put(communicationRecord)
      .pipe(
        map(response => {
          if (response) {
            const result = CommunicationRecord.toModel(response);
            callback();

            return communicationActions.UpdateCommunicationRecordSuccess({ communicationRecord: result });
          }

          return EMPTY;
        }),
        catchError((error: string) => of(communicationActions.Error({ error }))),
      )),
  ));

  updateCommunicationRecordSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.UpdateCommunicationRecordSuccess),
    tap(() => this.toaster.showSuccess('Communication record was updated')),
  ), { dispatch: false });

  deleteCommunication$ = createEffect((): any => this.actions$.pipe(
    ofType(communicationActions.DeleteCommunicationRecordRequest),
    mergeMap(action => this.communicationService.delete(action.id).pipe(
      switchMap(() => [
        communicationActions.DeleteCommunicationRecordSuccess(),
        communicationActions.GotoCommunicationsList({ id: action.claimantId }),
      ]),
      catchError((error: string) => of(communicationActions.Error({ error }))),
    )),
  ));

  deleteCommunicationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(
      communicationActions.DeleteCommunicationRecordSuccess,
      communicationActions.DeleteProjectCommunicationRecordSuccess,
    ),
    tap(() => {
      this.toaster.showSuccess('Communication record was deleted');
    }),
  ), { dispatch: false });

  gotoCommunicationsList$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.GotoCommunicationsList),
    tap(action => {
      const entity = action.entity || GridId.Claimants;
      this.router.navigate([entity, action.id, 'overview', 'tabs', 'communications']);
    }),
  ), { dispatch: false });

  gotoCommunication$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.GotoCommunication),
    tap(action => this.navigateToCommunication(action.claimantId, action.id, action.canReadNotes, action.entity)),
  ), { dispatch: false });

  navigateToCommunication = (claimantId: number, communicationId: string | number, canReadNotes: boolean, entity: GridId): void => {
    this.router.navigate([
      entity,
      claimantId,
      'overview',
      'tabs',
      'communications',
      communicationId,
      canReadNotes ? 'notes' : 'related-documents',
    ]);
  };

  getProjectCommunicationRecordRequest$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.GetProjectCommunicationRecordRequest),
    switchMap(({ projectCommunicationRecordId }: { projectCommunicationRecordId: number }) => this.projectCommunicationService.get(projectCommunicationRecordId)
      .pipe(
        switchMap(response => {
          if (response) {
            const result = ProjectCommunicationRecord.toModel(response);

            return [communicationActions.GetProjectCommunicationRecordSuccess({ projectCommunicationRecord: result }),
              rootActions.LoadingFinished({ actionName: communicationActions.GetProjectCommunicationRecordRequest.type })];
          }

          return [rootActions.LoadingFinished({ actionName: communicationActions.GetProjectCommunicationRecordRequest.type })];
        }),
        catchError((error: string) => of(communicationActions.Error({ error }))),
      )),
  ));

  saveProjectCommunicationRecordRequest$ = createEffect((): any => this.actions$.pipe(
    ofType(communicationActions.SaveProjectCommunicationRecordRequest),
    withLatestFrom(this.store.select(notesListSelectors.editableNote)),
    switchMap(([action, note]) => {
      // eslint-disable-next-line no-param-reassign
      action.projectCommunicationRecord.relatedNotes = [note];

      return this.projectCommunicationService.createCommunicationRecord(action.projectCommunicationRecord)
        .pipe(
          map(response => {
            if (response) {
              const result = ProjectCommunicationRecord.toModel(response);

              if (action.callback) {
                action.callback();
              }

              return communicationActions.SaveProjectCommunicationRecordSuccess({
                entityId: action.entityId,
                projectCommunicationRecord: result,
                canReadNotes: action.canReadNotes,
                entity: action.entity,
              });
            }

            return EMPTY;
          }),
          catchError((error: string) => of(communicationActions.Error({ error }))),
        );
    }),
  ));

  saveProjectCommunicationRecordSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.SaveProjectCommunicationRecordSuccess),
    tap(() => this.toaster.showSuccess('New Communication record was created')),
    tap(({ entityId, projectCommunicationRecord, canReadNotes, entity }) => this.navigateToCommunication(entityId, projectCommunicationRecord.id, canReadNotes, entity)),
  ), { dispatch: false });

  updateProjectCommunicationRecordRequest$ = createEffect((): any => this.actions$.pipe(
    ofType(communicationActions.UpdateProjectCommunicationRecordRequest),
    switchMap(({ projectCommunicationRecord, callback }) => this.projectCommunicationService.put(projectCommunicationRecord)
      .pipe(
        map(response => {
          if (response) {
            const result = ProjectCommunicationRecord.toModel(response);
            callback();

            return communicationActions.UpdateProjectCommunicationRecordSuccess({ projectCommunicationRecord: result });
          }

          return EMPTY;
        }),
        catchError(error => of(communicationActions.Error({ error }))),
      )),
  ));

  updateProjectCommunicationRecordSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.UpdateProjectCommunicationRecordSuccess),
    tap(() => this.toaster.showSuccess('Communication record was updated')),
  ), { dispatch: false });

  deleteProjectCommunicationRecordRequest$ = createEffect((): any => this.actions$.pipe(
    ofType(communicationActions.DeleteProjectCommunicationRecordRequest),
    mergeMap(action => this.projectCommunicationService.delete(action.id).pipe(
      switchMap(() => [
        communicationActions.DeleteProjectCommunicationRecordSuccess(),
        communicationActions.GotoCommunicationsList({ id: action.projectId, entity: GridId.Projects }),
      ]),
      catchError((error: string) => of(communicationActions.Error({ error }))),
    )),
  ));

  getCommunicationLevelsRequest$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.GetCommunicationLevelsRequest),
    switchMap(() => this.projectCommunicationService.getLevels()
      .pipe(
        switchMap(response => [communicationActions.GetCommunicationLevelsSuccess({ levels: response })]),
        catchError((error: string) => of(communicationActions.Error({ error }))),
      )),
  ));

  getCommunicationSentimentsRequest$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.GetCommunicationSentimentsRequest),
    switchMap(() => this.projectCommunicationService.getSentiments()
      .pipe(
        switchMap(response => [communicationActions.GetCommunicationSentimentsSuccess({ sentiments: response })]),
        catchError((error: string) => of(communicationActions.Error({ error }))),
      )),
  ));

  getContactsList$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.GetContactsList),
    mergeMap(action => this.projectContactsService.getContacts(SearchOptionsHelper.getFilterRequest(
      [
        SearchOptionsHelper.getContainsFilter('active', FilterTypes.Boolean, SearchTypeEnum.Equals, 'true'),
      ],
    ), action.projectId)
      .pipe(
        switchMap(response => {
          const contacts = response.items.map(contact => ProjectContactReference.toModel(contact));
          return [
            communicationActions.GetContactsListSuccess({ contacts }),
          ];
        }),
        catchError((error: string) => of(communicationActions.Error({ error }))),
      )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(communicationActions.Error),
    map(({ error }: { error: string }) => this.toaster.showError(error)),
  ), { dispatch: false });
}
