import { Auditable } from '../auditable';
import { IdValue } from '../idValue';
import { DeficiencySettingsConfig } from './deficiency-settings-config';

export class DeficiencySettingsTemplate extends Auditable {
  id: number;
  isSystemDefault: boolean;
  isDefault: boolean;
  templateName: string;
  type: string;
  disbursmentGroups: IdValue[];
  isOnlySystemDefaultExist?: boolean;
  deficiencyTypeSettings: DeficiencySettingsConfig[];
  projectId: number;

  public static toModel(item): DeficiencySettingsTemplate {
    if (!item) {
      return null;
    }

    return {
      ...super.toModel(item),
      id: item.id,
      isSystemDefault: item.isSystemDefault,
      isDefault: item.isDefault,
      templateName: item.templateName,
      type: item.type,
      disbursmentGroups: item.disbursmentGroups,
      isOnlySystemDefaultExist: item.isOnlySystemDefaultExist,
      deficiencyTypeSettings: item.deficiencyTypeSettings.map(DeficiencySettingsConfig.toModel),
      projectId: item.projectId,
    };
  }
}
