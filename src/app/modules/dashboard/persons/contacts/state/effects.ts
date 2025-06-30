import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
  switchMap,
  catchError,
  map,
  mergeMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { PersonContact } from '@app/models/person-contact';
import * as services from '@app/services';
import { MessageService } from '@app/services/message.service';
import { ToastService } from '@app/services/toast-service';
import { ModalService } from '@app/services';
import { PersonDuplicateList } from '@app/models/person-duplicate-list';
import { ContactState, selectors, actions } from '.';
import { ContactsDuplicateWarnComponent } from '../contacts-duplicate-warn/contacts-duplicate-warn.component';

@Injectable()
export class ContactsEffects {
  constructor(
    private contactService: services.ClientContactsService,
    private personService: services.PersonsService,
    private actions$: Actions,
    private store: Store<ContactState>,
    private messageService: MessageService,
    private toaster: ToastService,
    private modalService: ModalService,
  ) { }

  // Get list

  getContactList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAllPersonContactsRequest),
    switchMap(({ claimantId }) => this.contactService.getContacts(claimantId).pipe(
      map(contacts => {
        const res: PersonContact[] = contacts && contacts.map(x => PersonContact.toModel(x));
        return actions.GetAllPersonContactsSuccess({ contacts: res });
      }),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  // Create

  createContact$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateContact),
    mergeMap(action => this.contactService.post(PersonContact.toDto(action.relationship)).pipe(
      switchMap(response => (response.isDuplicateFound
        ? [actions.ShowDuplicateWarningModal({ duplicateList: response.duplicateCheckInfoList.map(PersonDuplicateList.toModel), createModal: action.modal, claimantId: action.relationship.clientId })]
        : [
          actions.CreateContactComplete({ claimantId: response.clientContact.clientId, modal: action.modal }),
          actions.GetAllPersonContactsRequest({ claimantId: response.clientContact.clientId }),
        ])),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  createContactSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateContactComplete),
    tap(({ modal }) => {
      modal.hide();
      this.toaster.showSuccess('New contact was created');
    }),
  ), { dispatch: false });

  showDuplicateWarningModal$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ShowDuplicateWarningModal),
    tap(action => {
      const initialState = {
        title: 'Duplicate Warning ',
        duplicateList: action.duplicateList,
        modal: action.createModal,
        claimantId: action.claimantId,
      };
      this.modalService.show(ContactsDuplicateWarnComponent, {
        initialState,
        class: 'duplicate-warn-modal',
      });
    }),
  ), { dispatch: false });

  // Update

  updateContact$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateContact),
    mergeMap(action => this.contactService.putContact(PersonContact.toDto(action.relationship)).pipe(
      switchMap(response => (response.isDuplicateFound
        ? [actions.ShowDuplicateWarningModal({ duplicateList: response.duplicateCheckInfoList.map(PersonDuplicateList.toModel), createModal: action.modal, claimantId: action.relationship.clientId })]
        : [
          actions.UpdateContactComplete({ relationship: response.clientContact, modal: action.modal }),
          actions.GetAllPersonContactsRequest({ claimantId: response.clientContact.clientId }),
        ])),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  updateContactSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateContactComplete),
    map(({ modal }) => {
      modal.hide();
      this.toaster.showSuccess('Contact was updated');
    }),
  ), { dispatch: false });

  // Delete

  deleteContacts$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteContactsRequest),
    mergeMap(({ clientContactId }) => this.messageService.showConfirmationDialog(
      'Confirm',
      'Are you sure you want to remove the contact from the claimant?',
      'Remove',
    )
      .pipe(
        withLatestFrom(this.store.select(selectors.currentClaimantIdSelector)),
        switchMap(
          ([answer, currentClaimantId]) => (!answer
            ? [actions.DeleteContactsCancelled()]
            : this.contactService.deleteContact(currentClaimantId, clientContactId).pipe(
              switchMap(() => [
                actions.DeleteContactsSuccess(),
                actions.RefreshContactsList(),
              ]),
              catchError(error => of(actions.Error({ error }))),
            )),
        ),
      )),
  ));

  deleteContactsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteContactsSuccess),
    map(() => [this.toaster.showSuccess('Selected contacts deleted')]),
  ), { dispatch: false });

  // Refresh

  refreshContactList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshContactsList),
    withLatestFrom(this.store.select(selectors.currentClaimantIdSelector)),
    switchMap(([, currentClaimantId]) => [actions.GetAllPersonContactsRequest({ claimantId: currentClaimantId })]),
  ));

  searchExistingPersonsToContact$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchExistingPersonToContact),
    switchMap(({ searchTerm }) => this.personService.getPersonListForContacts(searchTerm).pipe(
      map(persons => actions.SearchExistingPersonToContactComplete({ persons })),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  searchExistingPersonsToContactByIds$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchExistingPersonToContactByIds),
    switchMap(({ personsIds }) => this.personService.getPersonListByIds(personsIds).pipe(
      map(persons => actions.SearchExistingPersonToContactComplete({ persons })),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  searchExistingPersonToContact$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPersonContact),
    switchMap(({ clientContactId }) => this.contactService.get(clientContactId).pipe(
      switchMap((result: PersonContact) => [
        actions.GetPersonContactSuccess({ contact: PersonContact.toModel(result) }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getFullSsn$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPersonFullSSN),
    switchMap(({ personId }) => this.personService.getFullSsnByPersonId(personId).pipe(
      map(fullSsn => actions.GetPersonFullSSNComplete({ fullSsn })),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));
}
