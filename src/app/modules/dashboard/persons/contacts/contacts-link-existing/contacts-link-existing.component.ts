import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';

import * as fromRoot from '@app/state';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Person } from '@app/models';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ModalService } from '@app/services';
import { ContactsLinkPersonListComponent } from './person-list/person-list.component';
import * as fromContacts from '../state';

@Component({
  selector: 'app-contacts-link-existing',
  templateUrl: './contacts-link-existing.component.html',
  styleUrls: ['./contacts-link-existing.component.scss'],
})
export class ContactsLinkExistingComponent implements OnDestroy {
  @ViewChild(ContactsLinkPersonListComponent) personList: ContactsLinkPersonListComponent;

  public parentPersonId: number;
  public claimantId: number;
  public formGroup: UntypedFormGroup;
  public formSearch: UntypedFormGroup;
  public personsIds: number[];
  public modal: BsModalRef;

  public relationshipTypes$ = this.store.select(fromRoot.personRelationshipTypeValues);
  public representativeTypes$ = this.store.select(fromRoot.personRepresentativeTypesValues);

  public searchPersonsResult$ = this.store.select(fromContacts.selectors.searchExistingPersonToContactResult);
  public title: string;

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<fromRoot.AppState>,
    private contactsStore: Store<fromContacts.ContactState>,
    public modalService: ModalService,
  ) { }

  public ngOnInit(): void {
    if (this.personsIds) {
      this.contactsStore.dispatch(fromContacts.actions.SearchExistingPersonToContactByIds({ personsIds: this.personsIds }));
    }
    this.contactsStore.dispatch(fromContacts.actions.ResetStateError());

    this.formSearch = new UntypedFormGroup({ searchTerm: new UntypedFormControl('') });

    this.formSearch.controls.searchTerm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((val: string) => {
        if (!val) {
          this.personList.selectedPerson = null;
          this.contactsStore.dispatch(fromContacts.actions.ResetSearchExistingPersonToContact());
        } else {
          this.search();
        }
      });
  }

  public search(): void {
    this.personList.selectedPerson = null;
    this.contactsStore.dispatch(fromContacts.actions.SearchExistingPersonToContact({ searchTerm: this.formSearch.value.searchTerm }));
  }

  public resetSearch(): void {
    this.formSearch.reset();
  }

  public onSave(): void {
    this.store.dispatch(fromContacts.actions.LinkPerson({ person: Person.toModel(this.personList?.selectedPerson) }));
    this.modalService.hide();

    this.modal.content.canTogglePersonTemplateMode = true;

    if (this.modal.content.setSkipDuplicateChecking) {
      this.modal.content.setSkipDuplicateChecking();
    }

    if (this.modal.content.loadFullSsn) {
      this.modal.content.loadFullSsn();
    }
  }

  public ngOnDestroy(): void {
    this.contactsStore.dispatch(fromContacts.actions.ResetSearchExistingPersonToContact());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
