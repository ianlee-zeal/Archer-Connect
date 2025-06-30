import { createAction, props } from '@ngrx/store';
import {
  CommunicationDirection,
  CommunicationMethod,
  CommunicationPartyType,
  CommunicationResult,
  CommunicationSubject,
  CommunicationRecord,
} from '@app/models/communication-center';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ProjectCommunicationRecord } from '@app/models/communication-center/project-communication-record';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ProjectContactReference } from '@app/models/project-contact-reference';
import { MSGAttachmentData, MSGFileData } from '@sharpenednoodles/msg.reader-ts';
import { IPagerPayload } from '@app/modules/shared/state/common.actions';
import { EntityTypeEnum } from '@app/models/enums';
import { IdValue } from '../../../../models/idValue';

/**
 * Describes payload data for working with the communications related to some entity (claimant, project, etc)
 *
 * @export
 * @interface IEntityCommunicationsPayload
 */
export interface IEntityCommunicationsPayload extends IPagerPayload {

  /**
   * Payment id
   *
   * @type {number}
   * @memberof IEntityCommunicationsPayload
   */
  id?: number;

  /**
   * Parent entity id (claimant id, project id, etc)
   *
   * @type {number}
   * @memberof IEntityCommunicationsPayload
   */
  entityId: number;

  /**
   * Parent entity type
   *
   * @type {EntityTypeEnum}
   * @memberof IEntityCommunicationsPayload
   */
  entityType: EntityTypeEnum;

  /**
   * Grid params
   *
   * @type {IServerSideGetRowsParamsExtended}
   * @memberof IEntityCommunicationsPayload
   */
  agGridParams?: IServerSideGetRowsParamsExtended;
}

const FEATURE_NAME = '[Communications]';

export interface IAttachedEmail {
  file: File,
  outlookData: MSGFileData,
  attachments: MSGAttachmentData[],
}

export const GetCommunicationDetailsLoadingStarted = createAction(`${FEATURE_NAME} Get Communication Details Loading Started`, props<{ additionalActionNames: string[] }>());

export const GetCommunicationDirectionListRequest = createAction(`${FEATURE_NAME} Get Communication Direction Request`);
export const GetCommunicationDirectionListSuccess = createAction(`${FEATURE_NAME} Get Communication Direction Success`, props<{ communicationDirections: CommunicationDirection[] }>());

export const GetCommunicationMethodListRequest = createAction(`${FEATURE_NAME} Get Communication Method Request`);
export const GetCommunicationMethodListSuccess = createAction(`${FEATURE_NAME} Get Communication Method Success`, props<{ communicationMethods: CommunicationMethod[] }>());

export const GetCommunicationPartyTypeListRequest = createAction(`${FEATURE_NAME} Get Communication Party Type Request`);
export const GetCommunicationPartyTypeListSuccess = createAction(`${FEATURE_NAME} Get Communication Party Type Success`, props<{ communicationParties: CommunicationPartyType[] }>());

export const GetCommunicationResultListRequest = createAction(`${FEATURE_NAME} Get Communication Result List Request`, props<{ directionId: number, methodId: number }>());
export const GetCommunicationResultListSuccess = createAction(`${FEATURE_NAME} Get Communication Result List Success`, props<{ communicationResults: CommunicationResult[] }>());

export const GetCommunicationSubjectListRequest = createAction(`${FEATURE_NAME} Get Communication Subject List Request`, props<{ directionId: number, methodId: number }>());
export const GetCommunicationSubjectListSuccess = createAction(`${FEATURE_NAME} Get Communication Subject List Success`, props<{ communicationSubjects: CommunicationSubject[] }>());

export const SaveCommunicationRecordRequest = createAction(`${FEATURE_NAME} Save Communication Record Request`, props<{ entityId: number, communicationRecord: CommunicationRecord, canReadNotes: boolean, entity: GridId, callback?:() => void }>());
export const SaveCommunicationRecordSuccess = createAction(`${FEATURE_NAME} Save Communication Record Success`, props<{ entityId: number, communicationRecord: CommunicationRecord, canReadNotes: boolean, entity: GridId }>());

export const GetProjectCommunicationRecordRequest = createAction(`${FEATURE_NAME} Get Project Communication Record Request`, props<{ projectCommunicationRecordId: number }>());
export const GetProjectCommunicationRecordSuccess = createAction(`${FEATURE_NAME} Get Project Communication Record Success`, props<{ projectCommunicationRecord: ProjectCommunicationRecord }>());

export const SaveProjectCommunicationRecordRequest = createAction(`${FEATURE_NAME} Save Project Communication Record Request`, props<{ entityId: number, projectCommunicationRecord: ProjectCommunicationRecord, canReadNotes: boolean, entity: GridId, callback?:() => void }>());
export const SaveProjectCommunicationRecordSuccess = createAction(`${FEATURE_NAME} Save Project Communication Record Success`, props<{ entityId: number, projectCommunicationRecord: ProjectCommunicationRecord, canReadNotes: boolean, entity: GridId }>());

export const UpdateProjectCommunicationRecordRequest = createAction(`${FEATURE_NAME} Update Project Communication Record Request`, props<{ projectCommunicationRecord: any, callback?:() => void }>());
export const UpdateProjectCommunicationRecordSuccess = createAction(`${FEATURE_NAME} Update Project Communication Record Success`, props<{ projectCommunicationRecord: ProjectCommunicationRecord }>());

export const DeleteProjectCommunicationRecordRequest = createAction(`${FEATURE_NAME} Delete Project Communication Request`, props<{ id: number, projectId: number }>());
export const DeleteProjectCommunicationRecordSuccess = createAction(`${FEATURE_NAME} Delete Project Communication Success`);

export const GetCommunicationLevelsRequest = createAction(`${FEATURE_NAME} Get Communication Levels Request`);
export const GetCommunicationLevelsSuccess = createAction(`${FEATURE_NAME} Get Communication Levels Success`, props<{ levels: IdValue[] }>());

export const GetCommunicationSentimentsRequest = createAction(`${FEATURE_NAME} Get Communication Sentiments Request`);
export const GetCommunicationSentimentsSuccess = createAction(`${FEATURE_NAME} Get Communication Sentiments Success`, props<{ sentiments: IdValue[] }>());

export const GetContactsList = createAction(`${FEATURE_NAME} Get Contacts List`, props<{ projectId: number, agGridParams?: IServerSideGetRowsParamsExtended }>());
export const GetContactsListSuccess = createAction(`${FEATURE_NAME} Get Contacts List Success`, props<{ contacts: ProjectContactReference[] }>());

export const GetCommunicationRecordRequest = createAction(`${FEATURE_NAME} Get Communication Record Request`, props<{ communicationRecordId: number }>());
export const GetCommunicationRecordSuccess = createAction(`${FEATURE_NAME} Get Communication Record Success`, props<{ communicationRecord: CommunicationRecord }>());

export const UpdateCommunicationRecordRequest = createAction(`${FEATURE_NAME} Update Communication Record Request`, props<{ communicationRecord: any, callback?:() => void }>());
export const UpdateCommunicationRecordSuccess = createAction(`${FEATURE_NAME} Update Communication Record Success`, props<{ communicationRecord: CommunicationRecord }>());

export const CreateNewCommunicationRecord = createAction(`${FEATURE_NAME} Create New Communication Record`);
export const ResetCommunicationRecord = createAction(`${FEATURE_NAME} Reset Communication Record`);

export const ClearDropdownLists = createAction(`${FEATURE_NAME} Clear Dropdown Lists`);
export const GotoCommunicationsList = createAction(`${FEATURE_NAME} Go to Communications List`, props<{ id: number, entity?: GridId }>());
export const GotoCommunication = createAction(`${FEATURE_NAME} Go to Communication`, props<{ claimantId: number, id: number | string, canReadNotes: boolean, entity: GridId, canEditCommunication?: boolean }>());

export const SaveAttachedEmail = createAction(`${FEATURE_NAME} Save Attached Email `, props<{ attachedEmail: IAttachedEmail }>());
export const ClearAttachedEmail = createAction(`${FEATURE_NAME} Clear Attached Email `);

export const SaveEmail = createAction(`${FEATURE_NAME} Save Attached Email `, props<{ email: File }>());
export const ClearEmail = createAction(`${FEATURE_NAME} Clear Email `);

export const DeleteCommunicationRecordRequest = createAction(`${FEATURE_NAME} Delete Communication Request`, props<{ id: number, claimantId: number }>());
export const DeleteCommunicationRecordSuccess = createAction(`${FEATURE_NAME} Delete Communication Success`);

export const UpdateCommunicationDetailsActionBar = createAction(`${FEATURE_NAME} Update Communication Details Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const UpdateProjectCommunicationDocumentsCount = createAction(`${FEATURE_NAME} Update Project Communication Documents Count`, props<{ count: number }>());

export const Error = createAction(`${FEATURE_NAME} Error`, props<{ error: string }>());

export const SetCanEditCommunication = createAction(`${FEATURE_NAME} Set Can Edit Communication`, props<{ canEditCommunication: boolean }>());
