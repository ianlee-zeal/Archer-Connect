import { IdValue } from '../idValue';

export class DeficiencyType {
  id: number;
  deficiencyCategory: IdValue;
  name: string;
  entityType: IdValue;
  description: string;
  responsibleParty: IdValue;
  stages: IdValue[];
  deficiencyTypeProcess: IdValue;
  deficiencyTypeProcessId: number;
}
