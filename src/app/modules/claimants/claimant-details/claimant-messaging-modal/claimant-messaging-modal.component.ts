import { filter, takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { ProjectMessage } from '@app/models/projects/project-message';
import { MessageSectionTypeEnum } from '@app/models/enums/message-section-type.enum';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { ClaimantDetailsState } from '../state/reducer';

@Component({
  selector: 'app-claimant-messaging-modal',
  templateUrl: './claimant-messaging-modal.component.html',
  styleUrls: ['./claimant-messaging-modal.component.scss'],
})
export class ClaimantMessagingModalComponent implements OnInit, OnDestroy {
  clientId: number;
  projectMessages: ProjectMessage[];

  readonly projectMessages$ = this.store.select(selectors.projectMessages);
  protected ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private readonly modal: BsModalRef,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(actions.SetProjectMessagesModalStatus({ isOpen: true }));
    this.store.dispatch(actions.GetProjectMessagesByClientId({ clientId: this.clientId }));
    document.getElementsByTagName('modal-container')[0].classList.add('claimant-messaging-modal__container');

    this.projectMessages$.pipe(
      filter(messages => !!messages),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(messages => {
      if (messages.some(message => message.sectionType.id === MessageSectionTypeEnum.PrimaryFirm)) {
        this.projectMessages = messages.filter(message => message.sectionType.id === MessageSectionTypeEnum.PrimaryFirm
        || message.sectionType.id === MessageSectionTypeEnum.GeneralProject);
      } else {
        this.projectMessages = [...messages];
      }
    });
  }

  onClose() : void {
    this.modal.hide();
    this.store.dispatch(actions.SetProjectMessagesModalStatus({ isOpen: false }));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
