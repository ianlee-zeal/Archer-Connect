import { createAction, props } from '@ngrx/store';

import { PersonContact, Person } from '@app/models';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PersonDuplicateList } from '@app/models/person-duplicate-list';

const featureName = '[Person-Contacts]';

export const Error = createAction(`${featureName} Error`, props<{ error: string }>());
export const ResetStateError = createAction(`${featureName} Reset Error`);

export const GetPersonContact = createAction(`${featureName} Get By Id Request`, props<{ clientContactId: number }>());
export const GetPersonContactSuccess = createAction(`${featureName} Get By Id Success`, props<{ contact: PersonContact }>());
export const ResetPersonContact = createAction(`${featureName} Reset Person Contact`);

export const LinkPerson = createAction(`${featureName} Link Person to Contact`, props<{ person: Person }>());

export const UpdateContactModel = createAction(`${featureName} Update Contact`, props<{ contact: PersonContact }>());

export const GetPersonFullSSN = createAction(`${featureName} Get Person Full SSN`, props<{ personId: number }>());
export const GetPersonFullSSNComplete = createAction(`${featureName} Get Person Full SSN Complete`, props<{ fullSsn: string }>());
export const ResetPersonFullSSN = createAction(`${featureName} Reset Person Full SSN`);

export const GetAllPersonContactsRequest = createAction(`${featureName} Get All Request`, props<{ claimantId: number }>());
export const GetAllPersonContactsSuccess = createAction(`${featureName} Get All Success`, props<{ contacts: PersonContact[] }>());

export const CreateContact = createAction(`${featureName} Create New`, props<{ relationship: PersonContact, modal: BsModalRef }>());
export const CreateContactComplete = createAction(`${featureName} Create New Complete`, props<{ claimantId: number, modal: BsModalRef }>());

export const ShowDuplicateWarningModal = createAction(`${featureName} Show Duplicate Warning Modal`, props<{ duplicateList: PersonDuplicateList[], createModal: BsModalRef, claimantId: number }>());

export const UpdateContact = createAction(`${featureName} Update`, props<{ relationship: PersonContact, modal: BsModalRef }>());
export const UpdateContactComplete = createAction(`${featureName} Update Complete`, props<{ relationship: PersonContact, modal: BsModalRef }>());

export const DeleteContactsRequest = createAction(`${featureName} Delete Contacts Request`, props<{ clientContactId: number }>());
export const DeleteContactsSuccess = createAction(`${featureName} Delete Contacts Success`);
export const DeleteContactsCancelled = createAction(`${featureName} Delete Contacts Cancelled`);

export const RefreshContactsList = createAction(`${featureName} Refresh Contacts List`);

export const SearchExistingPersonToContact = createAction(`${featureName} Search Existing Person To Contact`, props<{ searchTerm: string }>());
export const SearchExistingPersonToContactByIds = createAction(`${featureName} Search Existing Person To Contact By Ids`, props<{ personsIds: number[] }>());
export const SearchExistingPersonToContactComplete = createAction(`${featureName} Search Existing Person To Contact Complete`, props<{ persons: Person[] }>());
export const ResetSearchExistingPersonToContact = createAction(`${featureName} Reset Search Existing Person To Contact`);
