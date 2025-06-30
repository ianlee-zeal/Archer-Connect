import { IdValue } from '../idValue';
import { Status } from '../status';
import { DeficiencyType } from './deficiency-type';

export class DeficiencySettingsConfigDto {
  id: number;
  active: boolean;
}

export class DeficiencySettingsConfig {
  id: number;
  category: string;
  productCategoryId: number;
  severityStatus: Status;
  deficiencyType: DeficiencyType;
  deficiencyTypeProcess: IdValue;
  entityTypeId: number;
  deficiencyTypeProcessId: number;
  entityId: number;
  isDefaultSetting: boolean;
  isOverridePermitted: boolean;
  isOverridePermittedChangeable: boolean;
  isSeverityIdChangeable: boolean;
  isActiveChangeable: boolean;
  active: boolean;
  isRelatedProcess: boolean;

  public static toModel(item): DeficiencySettingsConfig {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      category: item.category,
      productCategoryId: item.productCategoryId,
      severityStatus: item.severityStatus,
      deficiencyType: item.deficiencyType,
      deficiencyTypeProcess: item.deficiencyTypeProcess,
      entityTypeId: item.entityTypeId,
      deficiencyTypeProcessId: item.deficiencyTypeProcessId,
      entityId: item.entityId,
      isDefaultSetting: item.isDefaultSetting,
      isOverridePermitted: item.isOverridePermitted,
      isOverridePermittedChangeable: item.isOverridePermittedChangeable,
      isSeverityIdChangeable: item.isSeverityIdChangeable,
      isActiveChangeable: item.isActiveChangeable,
      active: item.active,
      isRelatedProcess: item.isRelatedProcess,
    };
  }

  public static toDto(item: DeficiencySettingsConfig): DeficiencySettingsConfigDto {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      active: item.active,
    };
  }
}
