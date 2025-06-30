import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ModalService, PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as fromClaimants from '@app/modules/claimants/claimant-details/state/selectors';
import { BsModalService } from 'ngx-bootstrap/modal';
import * as fromPersons from '../../state';
import { ContactsEditComponent } from '../../contacts/contacts-edit/contacts-edit.component';

@Component({
  selector: 'app-person-contacts-tab',
  templateUrl: './person-contacts-tab.component.html',
  styleUrls: ['./person-contacts-tab.component.scss'],
  providers: [ModalService, BsModalService],
})
export class PersonContactsTabComponent implements OnInit, OnDestroy {
  // public person$ = this.store.select(sharedSelectors.personGeneralInfoSelectors.person);
  public claimant$ = this.store.select(fromClaimants.item);
  // private personId: number;
  private claimantId: number;

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<fromPersons.PersonState>,
    private modalService: ModalService,
  ) { }

  public ngOnInit(): void {
    this.store.dispatch(fromPersons.actions.UpdateActionBar({
      actionBar: {
        new: {
          callback: () => this.addContact(),
          permissions: PermissionService.create(PermissionTypeEnum.ClientContact, PermissionActionTypeEnum.Create),
        },
        back: () => this.cancel(),
      },
    }));

    this.addClaimantListener();
  }

  private addClaimantListener(): void {
    this.claimant$
      .pipe(
        filter(claimant => !!claimant),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(claimant => {
        this.claimantId = claimant.id;
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public addContact(): void {
    const initialState = {
      title: 'Create New Contact',
      claimantId: this.claimantId,
      canEdit: true,
    };

    this.modalService.show(ContactsEditComponent, {
      initialState,
      class: 'contact-modal',
    });
  }

  private cancel(): void {
    this.store.dispatch(fromPersons.actions.GoBack());
  }
}
