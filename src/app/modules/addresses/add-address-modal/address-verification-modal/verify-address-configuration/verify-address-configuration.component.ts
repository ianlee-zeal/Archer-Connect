import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Subject } from 'rxjs';

import { AddressVerificationConfiguration } from '@app/models/address';
import * as fromShared from '../../../state';
const { sharedActions, sharedSelectors } = fromShared;

@Component({
  selector: 'app-verify-address-configuration',
  templateUrl: './verify-address-configuration.component.html',
  styleUrls: ['./verify-address-configuration.component.scss'],
})
export class VerifyAddressConfigurationComponent implements OnInit, OnDestroy {
  protected ngUnsubscribe$ = new Subject<void>();
  public form: UntypedFormGroup;

  public config$ = this.store.select(sharedSelectors.addressVerificationModalSelectors.verifyConfiguration);

  constructor(private store: Store<fromShared.AppState>) {}

  ngOnInit() {
    this.form = new UntypedFormGroup({
      advancedAddressCorrection: new UntypedFormControl(),
      includeName: new UntypedFormControl(),
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onChange(): void {
    const config: AddressVerificationConfiguration = {
      ...this.form.getRawValue(),
    };

    this.store.dispatch(sharedActions.addressVerificationActions.ChangeVerificationConfiguration({ verifyConfiguration: config }));
  }
}
