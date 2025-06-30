import { IdActivePair } from '../id-active';

export interface IDeficiencySettingsTemplateUpdate {
  id: number;
  isDefault: boolean;
  templateName: string;
  projectId: number;
  settingItems: IdActivePair[];
}
