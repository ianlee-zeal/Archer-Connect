import { EntityTypeEnum } from '@app/models/enums';

export interface QuickSearchOption {
  id: EntityTypeEnum;
  name: string;
  placeholder: string;
  active: boolean;
  payload?: any;
  displayField?: string;
}