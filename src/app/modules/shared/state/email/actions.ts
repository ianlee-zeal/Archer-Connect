import { Email } from '@app/models';
import { EntityTypeEnum } from '@app/models/enums';
import { createAction, props } from '@ngrx/store';

const featureName = '[Shared Email List]';

export const GetPrimaryEmailByEntity = createAction(`${featureName} Get Primary Email By Entity`, props<{ entityType: EntityTypeEnum, entityId: number }>());
export const GetPrimaryEmailByEntityComplete = createAction(`${featureName} Get Primary Email By Entity Complete`, props<{ primaryEmail: Email }>());
export const Error = createAction(`${featureName} Error`, props<{ errorMessage: string }>());
