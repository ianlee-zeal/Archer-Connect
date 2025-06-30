import { createAction, props } from '@ngrx/store';

import { Document } from '@app/models/documents/document';
import { EntityTypeEnum } from '@app/models/enums';
import { IdValue } from '@app/models';
import { SelectOption } from '../../_abstractions/base-select';

export const CreateDocument = createAction('[Shared Upload Document Modal] Create Document', props<{ file: File, document: Document, onDocumentLoaded:(document: Document) => void }>());
export const CreateDocumentComplete = createAction('[Shared Upload Document Modal] Create Document Complete', props<{ document: Document, onDocumentLoaded:(document: Document) => void }>());
export const ResetCreateDocumentState = createAction('[Shared Upload Document Modal] Reset Create Document State');
export const DocumentError = createAction('[Shared Upload Document Modal] Document Error', props<{ error: any }>());

export const GetOrgsOptionsRequest = createAction('[Shared Upload Document Modal] Get Orgs Options Request', props<{ search?: any }>());
export const GetOrgsOptionsComplete = createAction('[Shared Upload Document Modal] Get Orgs Options Complete', props<{ orgsOptions: SelectOption[] }>());
export const GetOrgsOptionsError = createAction('[Shared Upload Document Modal] Get Orgs Options Error', props<{ error: any }>());

export const LoadDefaultOrgs = createAction('[Shared Upload Document Modal] Load Default Orgs', props<{ entityTypeId: EntityTypeEnum, entityId: number }>());
export const LoadDefaultOrgsComplete = createAction('[Shared Upload Document Modal] Load Default Orgs Complete', props<{ defaultOrgs: IdValue[] }>());
export const LoadDefaultOrgsError = createAction('[Shared Upload Document Modal] Load Default Orgs Error', props<{ error: any }>());
