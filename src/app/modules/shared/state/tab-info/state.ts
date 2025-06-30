import { EntityTypeEnum } from '@app/models/enums';
import { IDictionary } from '../../../../models/utils/dictionary';

export interface TabInfoState {
  error: string;
  tabsCount: {
    [entityTypeId in EntityTypeEnum]: IDictionary<number, number>
  };
}

export const initialState: TabInfoState = {
  error: null,
  tabsCount: null,
};
