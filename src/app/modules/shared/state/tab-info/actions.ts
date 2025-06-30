import { createAction, props } from '@ngrx/store';

import { IDictionary } from '../../../../models/utils/dictionary';
import { EntityTypeEnum } from '../../../../models/enums/entity-type.enum';

const featureName = '[Tab Info]';

export const Error = createAction(`${featureName} Error`, props<{ error: string }>());
export const GetTabsCount = createAction(`${featureName} Get Tabs Count`, props<{ entityId: number, entityTypeId: EntityTypeEnum, tabsList: EntityTypeEnum[] }>());
export const GetTabsCountSuccess = createAction(`${featureName} Get Tabs Count Success`, props<{ entityTypeId: EntityTypeEnum, tabsCount: IDictionary<number, number> }>());
