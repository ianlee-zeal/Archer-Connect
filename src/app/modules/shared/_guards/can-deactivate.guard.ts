import { Injectable } from '@angular/core';


import { MessageService } from '@app/services/message.service';
import { Editable } from '../_abstractions/editable';

@Injectable({ providedIn: 'root' })
export class CanDeactivateGuard  {
  constructor(private messageService: MessageService) {
  }

  canDeactivate(component: Editable) {
    return !component.canLeave
      ? this.messageService.showConfirmationDialog(
        'Confirm',
        'Changes you have made will not be saved.',
      )
      : true;
  }
}
