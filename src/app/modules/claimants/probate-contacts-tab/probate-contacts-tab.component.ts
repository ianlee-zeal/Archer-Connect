/* eslint-disable no-restricted-globals */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ModalService, PermissionService } from '@app/services';
import { Subject } from 'rxjs';
import { first, takeUntil, filter } from 'rxjs/operators';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as fromContacts from '@app/modules/dashboard/persons/contacts/state/index';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ContactsEditComponent } from '@app/modules/dashboard/persons/contacts/contacts-edit/contacts-edit.component';
import { ClaimantDetailsState } from '../claimant-details/state/reducer';
import * as selectors from '../claimant-details/state/selectors';
import * as actions from '../claimant-details/state/actions';

@Component({
  selector: 'app-probate-contacts-tab',
  templateUrl: './probate-contacts-tab.component.html',
  styleUrls: ['./probate-contacts-tab.component.scss'],
  providers: [ModalService, BsModalService],
})
export class ProbateContactsTabComponent implements OnInit, OnDestroy {
  claimantId: number;
  totalPercentageAllocated: number;

  readonly actionBar$ = this.store.select(selectors.actionBar);
  readonly claimant$ = this.store.select(selectors.item);
  readonly personContacts$ = this.store.select(fromContacts.selectors.personContactListSelector);
  readonly entityType = EntityTypeEnum.Probates;

  private ngUnsubscribe$ = new Subject<void>();
  private reloadProbateDetailsOnContactsUpdate = false;

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private readonly modalService: ModalService,
  ) { }

  ngOnInit(): void {
    this.actionBar$
      .pipe(first(actionBar => !!actionBar))
      .subscribe(actionBar => {
        this.store.dispatch(actions.UpdateClaimantsActionBar({
          actionBar: {
            ...actionBar,
            new: {
              callback: () => this.onAddContact(),
              permissions: PermissionService.create(PermissionTypeEnum.ClientContact, PermissionActionTypeEnum.Create),
            },
          },
        }));
      });

    this.personContacts$
      .pipe(
        filter(contacts => !!contacts),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(contacts => {
        this.totalPercentageAllocated = contacts.reduce((pr, cur) => ((!isNaN(cur.percentageAllocation)) ? pr + cur.percentageAllocation : 0), 0);
        if (this.reloadProbateDetailsOnContactsUpdate) {
          this.store.dispatch(actions.GetProbateDetailsByClientId({ clientId: this.claimantId }));
          this.reloadProbateDetailsOnContactsUpdate = false;
        }
      });

    this.claimant$
      .pipe(
        filter(claimant => !!claimant),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(claimant => {
        this.claimantId = claimant.id;
      });
  }

  public onAddContact(): void {
    const initialState = {
      title: 'Create New Contact',
      claimantId: this.claimantId,
      canEdit: true,
      entityType: this.entityType,
      saveStarted: () => this.onEditStarted(),
    };

    this.modalService.show(ContactsEditComponent, {
      initialState,
      class: 'contact-modal',
    });
  }

  onEditStarted() {
    this.reloadProbateDetailsOnContactsUpdate = true;
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
