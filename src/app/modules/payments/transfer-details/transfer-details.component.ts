import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState } from '@app/state/index';

import { ActivatedRoute } from '@angular/router';
import { PaymentDetailsComponent } from '../payment-details/payment-details.component';

@Component({
  selector: 'app-transfer-details',
  templateUrl: './transfer-details.component.html',
  styleUrls: ['./transfer-details.component.scss'],
})
export class TransferDetailsComponent extends PaymentDetailsComponent {

  constructor(
    protected readonly store: Store<AppState>,
    protected readonly route: ActivatedRoute,
  ) {
    super(store, route)
   }

}
