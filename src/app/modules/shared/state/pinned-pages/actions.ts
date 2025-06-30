import { createAction, props } from '@ngrx/store';
import { PinnedPage } from '@app/models';
import { EntityTypeEnum } from '@app/models/enums';

const FEATURE_NAME = '[PinnedPages]';

export const GetPinnedPages = createAction(`${FEATURE_NAME} Get Pinned Pages`);
export const GetPinnedPagesComplete = createAction(`${FEATURE_NAME} Get Pinned Pages Complete`, props<{ pinnedPages: PinnedPage[] }>());

export const CreatePinnedPage = createAction(`${FEATURE_NAME} Create Pinned Page`, props<{ view: PinnedPage, callback: () => void }>());
export const RemovePinnedPage = createAction(`${FEATURE_NAME} Remove Pinned Page`, props<{ entityId: number, entityType: EntityTypeEnum, callback: () => void }>());

export const Error = createAction(`${FEATURE_NAME} Error`, props<{ errorMessage: string }>());