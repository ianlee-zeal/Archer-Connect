import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import { VerifiedAddress } from '@app/models/address';
import { EntityAddress } from '@app/models';
import { Subject } from 'rxjs';
import * as fromShared from '../../../state';

const { sharedActions } = fromShared;

@Component({
  selector: 'app-verify-address',
  templateUrl: './verify-address.component.html',
  styleUrls: ['./verify-address.component.scss'],
})
export class VerifyAddressComponent implements OnInit, OnDestroy {
  protected ngUnsubscribe$ = new Subject<void>();
  @Input() originalAddress: EntityAddress;
  @Input() verifiedAddress: VerifiedAddress;
  @Input() name: string;
  @Input() showName: boolean;
  @Input() canEdit: boolean = false;

  public useVerifiedAddress: boolean;

  constructor(
    private store: Store<fromShared.AppState>,
  ) {}

  ngOnInit(): void {
    this.useVerifiedAddress = this.verifiedAddress.statusCode !== -1;
    this.dispatchUseVerifiedAddress();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onUseVerifiedAddressChange(value: boolean): void {
    this.useVerifiedAddress = value;
    this.dispatchUseVerifiedAddress();
  }

  private dispatchUseVerifiedAddress(): void {
    this.store.dispatch(sharedActions.addressVerificationActions.UseVerifiedAddress({ useVerifiedAddress: this.useVerifiedAddress }));
  }
}
