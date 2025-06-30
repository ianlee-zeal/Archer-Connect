/* eslint-disable @typescript-eslint/no-use-before-define */
import { createReducer, on, Action } from '@ngrx/store';

import { CommunicationDirection } from '@app/models/communication-center/communication-direction';
import { CommunicationMethod } from '@app/models/communication-center/communication-method';
import { CommunicationResult } from '@app/models/communication-center/communication-result';
import { CommunicationPartyType } from '@app/models/communication-center/communication-party-type';
import { CommunicationSubject } from '@app/models/communication-center/communication-subject';
import { CommunicationRecord } from '@app/models/communication-center/communication-record';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as documentDetailsActions from '@app/modules/shared/state/document-details/actions';
import * as documentUploadActions from '@app/modules/shared/state/upload-document/actions';
import { ProjectCommunicationRecord } from '@app/models/communication-center/project-communication-record';
import { ProjectContactReference } from '@app/models/project-contact-reference';
import { IdValue } from '../../../../models/idValue';
import * as actions from './actions';
import { IAttachedEmail } from './actions';

export interface CommunicationState {
  communicationDirections: CommunicationDirection[];
  communicationMethods: CommunicationMethod[];
  communicationParties: CommunicationPartyType[];
  communicationResults: CommunicationResult[];
  communicationSubjects: CommunicationSubject[];
  levels: IdValue[];
  sentiments: IdValue[];
  contacts: ProjectContactReference[];
  detailsPage: {
    currentCommunicationRecord: CommunicationRecord | ProjectCommunicationRecord;
  },
  canEditCommunication: boolean,
  actionBar: ActionHandlersMap,
  attachedEmails: IAttachedEmail[],
  email: File,
  error: string | null;
}

export const communicationState: CommunicationState = {
  communicationDirections: [],
  communicationMethods: [],
  communicationParties: [],
  communicationResults: [],
  communicationSubjects: [],
  levels: [],
  sentiments: [],
  contacts: [],
  detailsPage: { currentCommunicationRecord: null },
  canEditCommunication: false,
  actionBar: null,
  attachedEmails: null,
  email: null,
  error: null,
};

export const Reducer = createReducer(
  communicationState,

  on(actions.ClearDropdownLists, state => ({
    ...state,
    communicationDirections: [],
    communicationMethods: [],
    communicationParties: [],
    communicationResults: [],
    communicationSubjects: [],
  })),

  on(actions.GotoCommunication, (state, { canEditCommunication }) => ({ ...state, canEditCommunication })),

  on(actions.GetCommunicationDirectionListRequest, state => ({ ...state, error: null })),
  on(actions.GetCommunicationDirectionListSuccess, (state, { communicationDirections }) => ({ ...state, communicationDirections })),

  on(actions.GetCommunicationMethodListSuccess, (state, { communicationMethods }) => ({ ...state, communicationMethods, error: null })),
  on(actions.GetCommunicationPartyTypeListSuccess, (state, { communicationParties }) => ({ ...state, communicationParties, error: null })),
  on(actions.GetCommunicationResultListSuccess, (state, { communicationResults }) => ({ ...state, communicationResults, error: null })),
  on(actions.GetCommunicationSubjectListSuccess, (state, { communicationSubjects }) => ({ ...state, communicationSubjects, error: null })),
  on(actions.GetCommunicationLevelsSuccess, (state, { levels }) => ({ ...state, levels, error: null })),
  on(actions.GetCommunicationSentimentsSuccess, (state, { sentiments }) => ({ ...state, sentiments, error: null })),
  on(actions.GetContactsListSuccess, (state, { contacts }) => ({ ...state, contacts, error: null })),

  on(actions.GetCommunicationRecordRequest, state => ({
    ...state,
    detailsPage: { currentCommunicationRecord: null },
    error: null,
  })),

  on(actions.GetCommunicationRecordSuccess, (state, { communicationRecord }) => ({
    ...state,
    detailsPage: { currentCommunicationRecord: communicationRecord },
  })),

  on(actions.UpdateCommunicationRecordSuccess, (state, { communicationRecord }) => ({
    ...state,
    detailsPage: { currentCommunicationRecord: { ...communicationRecord } },
    error: null,
  })),

  on(actions.ResetCommunicationRecord, state => ({
    ...state,
    detailsPage: {
      ...state.detailsPage,
      currentCommunicationRecord: null,
    },
  })),

  on(actions.CreateNewCommunicationRecord, state => ({
    ...state,
    detailsPage: {
      ...state.detailsPage,
      currentCommunicationRecord: {} as CommunicationRecord,
    },
  })),

  on(actions.GetProjectCommunicationRecordRequest, state => ({
    ...state,
    detailsPage: { currentCommunicationRecord: null },
    error: null,
  })),

  on(actions.GetProjectCommunicationRecordSuccess, (state, { projectCommunicationRecord }) => ({
    ...state,
    detailsPage: { currentCommunicationRecord: projectCommunicationRecord },
  })),

  on(actions.UpdateProjectCommunicationRecordSuccess, (state, { projectCommunicationRecord }) => ({
    ...state,
    detailsPage: { currentCommunicationRecord: { ...projectCommunicationRecord } },
    error: null,
  })),

  on(actions.UpdateCommunicationDetailsActionBar, (state, { actionBar }) => ({ ...state, actionBar })),

  on(actions.Error, (state, { error }) => ({ ...state, error })),

  on(documentDetailsActions.DeleteDocumentComplete, state => changeRelatedDocsCountReducer(state, true)),

  on(documentUploadActions.CreateDocumentComplete, state => changeRelatedDocsCountReducer(state, false)),

  on(actions.SaveAttachedEmail, (state, { attachedEmail }) => attachedEmailsReducer(state, attachedEmail)),
  on(actions.UpdateProjectCommunicationDocumentsCount, (state, { count }) => ({
    ...state,
    detailsPage: {
      ...state.detailsPage,
      currentCommunicationRecord: {
        ...state.detailsPage.currentCommunicationRecord,
        relatedDocumentsCount: count,
      },
    },
  })),

  on(actions.SaveEmail, (state, { email }) => ({ ...state, email })),
  on(actions.ClearEmail, state => ({ ...state, email: null })),

  on(actions.ClearAttachedEmail, state => ({ ...state, attachedEmails: null })),

  on(actions.SetCanEditCommunication, (state, { canEditCommunication }) => ({ ...state, canEditCommunication })),
);

export function reducer(state: CommunicationState | undefined, action: Action) {
  return Reducer(state, action);
}

function changeRelatedDocsCountReducer(state: CommunicationState, isDocDeleted: boolean): CommunicationState {
  const communicationRecord: CommunicationRecord = state.detailsPage.currentCommunicationRecord;

  if (communicationRecord) {
    const newRelatedDocsCount = isDocDeleted
      ? communicationRecord.relatedDocumentsCount - 1
      : communicationRecord.relatedDocumentsCount + 1;

    return {
      ...state,
      detailsPage: {
        currentCommunicationRecord: {
          ...state.detailsPage.currentCommunicationRecord,
          relatedDocumentsCount: newRelatedDocsCount,
        },
      },
    };
  }

  return { ...state };
}

function attachedEmailsReducer(state: CommunicationState, attachedEmail: IAttachedEmail): CommunicationState {
  let attachedEmails = state.attachedEmails || [];
  if (!attachedEmails.some(email => JSON.stringify(email.outlookData) === JSON.stringify(attachedEmail.outlookData))) {
    attachedEmails = [...attachedEmails, attachedEmail];
  }

  return { ...state, attachedEmails };
}
