import { ApiErrorResponse } from '@app/models/api-error-response';
import { Person } from '@app/models/person';
import { ActionHandlersMap } from '../../action-bar/action-handlers-map';

export interface SharedPersonGeneralInfoState {
  person: Person;
  personDetailsHeader: Person;
  isFullSsnLoaded: boolean;
  isFullOtherIdentifierLoaded: boolean;
  isPersonValid: boolean,
  prevPersonId: number;
  actionBar: ActionHandlersMap;
  error: string | ApiErrorResponse;
}

export const initialState: SharedPersonGeneralInfoState = {
  person: null,
  personDetailsHeader: null,
  isFullOtherIdentifierLoaded: null,
  isFullSsnLoaded: false,
  isPersonValid: false,
  prevPersonId: null,
  actionBar: null,
  error: null,
};
