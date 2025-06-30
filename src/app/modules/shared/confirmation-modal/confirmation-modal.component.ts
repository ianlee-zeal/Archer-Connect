import { Component } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent {
  title: string;
  message: string;
  confirmed: boolean;
  buttonOkText: string;
  showConfirmMsgClass: boolean = true;
  public onRespond: (confirmed: boolean) => void;

  respond(confirmed: boolean) {
    this.onRespond(confirmed);
  }
}
