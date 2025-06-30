import { OrgType } from '@app/models/org-type';

export interface OrgTypesState {
  types: OrgType[];
  initiallySelected: number[];
  selected: number[];
  isDirty: boolean;
}

export const orgTypesInitialState: OrgTypesState = {
  types: null,
  initiallySelected: [],
  selected: [],
  isDirty: false,
}
