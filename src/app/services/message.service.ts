import { Injectable } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';

import { ConfirmationDialogComponent } from '@app/modules/shared/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationWithNoteDialogComponent } from '@app/modules/shared/confirmation-with-note-dialog/confirmation-with-note-dialog.component';
import { AlertDialogComponent } from '@app/modules/shared/alert-dialog/alert-dialog.component';
import { ModalService } from './modal.service';
import { ConfirmedWithNote } from '@app/models/confirmed-with-note'
import { InfoDialogComponent } from '@app/modules/shared/info-dialog/info-dialog.component';

@Injectable({ providedIn: 'root' })
export class MessageService {
  bsModalRef: BsModalRef;

  constructor(
    private readonly modalService: ModalService,
  ) { }

  private getConfirmSubscriber() {
    return observer => {
      const subscription = this.modalService.onHidden.subscribe(() => {
        observer.next(this.bsModalRef.content.confirmed);
        observer.complete();
      });

      return {
        unsubscribe() {
          subscription.unsubscribe();
        },
      };
    };
  }

  private getConfirmWithNoteSubscriber() {
    return observer => {
      const subscription = this.modalService.onHidden.subscribe(() => {
        const res = { confirmed: this.bsModalRef.content.confirmed, note: this.bsModalRef.content.note };
        observer.next(res);
        observer.complete();
      });

      return {
        unsubscribe() {
          subscription.unsubscribe();
        },
      };
    };
  }

  public showConfirmationDialog(title: string, message: string, buttonOkText: string = null): Observable<boolean> {
    const initialState = {
      title,
      message,
      buttonOkText,
    };

    this.bsModalRef = this.modalService.show(ConfirmationDialogComponent, { initialState });

    return new Observable<boolean>(this.getConfirmSubscriber());
  }

  public showConfirmationWithNoteDialog(title: string, message: string, buttonOkText: string = null, note: string = null): Observable<ConfirmedWithNote> {
    const initialState = {
      title,
      message,
      buttonOkText,
      note,
    };

    this.bsModalRef = this.modalService.show(ConfirmationWithNoteDialogComponent, { initialState, class: 'modal-md' });

    return new Observable<ConfirmedWithNote>(this.getConfirmWithNoteSubscriber());
  }

  public showDeleteConfirmationDialog(title: string, message: string): Observable<boolean> {
    return this.showConfirmationDialog(title, message, 'Delete');
  }

  public showAlertDialog(title: string, message: string, buttonOkText: string = null): Observable<boolean> {
    const initialState = {
      title,
      message,
      buttonOkText,
    };
    this.bsModalRef = this.modalService.show(AlertDialogComponent, { initialState });
    return new Observable<boolean>(this.getConfirmSubscriber());
  }

  public showInfoDialog(title: string, message: string, buttonText: string = 'Close'): Observable<boolean> {
    this.bsModalRef = this.modalService.show(InfoDialogComponent, { class: 'modal-md', initialState: { title, message, buttonText } });
    return new Observable<boolean>(this.getConfirmSubscriber());
  }
}
