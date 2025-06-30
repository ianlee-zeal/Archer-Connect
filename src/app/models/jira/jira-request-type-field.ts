import { JiraFieldRenderTypeEnum } from '@app/models/jira/jira-field-render-type.enum';

interface KeyValuePair {
  key: string | null;
  value: string | null;
}

export class JiraRequestTypeField {
  id: string;
  label:string;
  description: string;
  required: boolean;
  jiraFieldType: JiraFieldRenderTypeEnum;
  items: KeyValuePair[];
  defaultItemId: string;
}
