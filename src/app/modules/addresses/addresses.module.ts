import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { sharedReducer } from './state/shared.reducer';
import { sharedEffects } from './state/shared.effects';
import { FEATURE_NAME } from './state/shared.state';
import { AddressListActionsRendererComponent } from './address-list/address-list-actions-renderer/address-list-actions-renderer.component';
import { AddAddressModalComponent } from './add-address-modal/add-address-modal.component';
import { AddressVerificationModalComponent } from './add-address-modal/address-verification-modal/address-verification-modal.component';
import { AddressVerificationOriginalLineItemComponent } from './add-address-modal/address-verification-modal/address-verification-original-line-item/address-verification-original-line-item.component';
import { AddressVerificationValidatedLineItemComponent } from './add-address-modal/address-verification-modal/address-verification-validated-line-item/address-verification-validated-line-item.component';
import { MoveCheckAddressConfigurationComponent } from './add-address-modal/address-verification-modal/move-check-address-configuration/move-check-address-configuration.component';
import { VerifyAddressConfigurationComponent } from './add-address-modal/address-verification-modal/verify-address-configuration/verify-address-configuration.component';
import { VerifyAddressComponent } from './add-address-modal/address-verification-modal/verify-address/verify-address.component';
import { MoveCheckAddressComponent } from './add-address-modal/address-verification-modal/move-check-address/move-check-address.component';
import { AddressFormComponent } from './add-address-modal/address-form/address-form.component';
import { AddressListComponent } from './address-list/address-list.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    AddAddressModalComponent,
    AddressFormComponent,
    AddressListComponent,
    AddressListActionsRendererComponent,
    MoveCheckAddressComponent,
    VerifyAddressComponent,
    VerifyAddressConfigurationComponent,
    AddressVerificationModalComponent,
    MoveCheckAddressConfigurationComponent,
    AddressVerificationOriginalLineItemComponent,
    AddressVerificationValidatedLineItemComponent,
  ],
  exports: [
    AddressListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    SharedModule,
    AgGridModule,
    StoreModule.forFeature(FEATURE_NAME, sharedReducer),
    EffectsModule.forFeature([...sharedEffects]),
  ],
})

export class AddressesModule { }
