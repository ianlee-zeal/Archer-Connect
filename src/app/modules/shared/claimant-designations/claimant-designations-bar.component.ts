import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { ClaimantDetailsState } from 'src/app/modules/claimants/claimant-details/state/reducer';
import * as fromClaimants from 'src/app/modules/claimants/claimant-details/state/selectors';
import { MessageService } from '@app/services';

@Component({
  selector: 'app-claimant-designations-bar',
  templateUrl: './claimant-designations-bar.component.html',
  styleUrls: ['./claimant-designations-bar.component.scss'],
})
export class ClaimantDesignationsBarComponent {
  public readonly item$ = this.store.select(fromClaimants.item);
  public readonly designatedNotes$ = this.store.select(fromClaimants.designatedNotes);

  constructor(
    private store: Store<ClaimantDetailsState>,
    private readonly messageService: MessageService,
  ) {}

  openDesignatedNoteModal(designatedNotes: string): void {
    this.messageService.showAlertDialog(
      'Designated Representative Notes',
      designatedNotes,
      'Close',
    );
  }
}
