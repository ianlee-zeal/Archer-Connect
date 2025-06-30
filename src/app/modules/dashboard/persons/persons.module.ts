import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ModalModule } from 'ngx-bootstrap/modal';

import { SharedModule } from '@shared/shared.module';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { AddressesModule } from '@app/modules/addresses/addresses.module';
import { ContactsReducer } from './contacts/state/reducer';
import { ContactsEffects } from './contacts/state/effects'; import { PersonReducer } from './state/reducer';
import { PersonsEffects } from './state/effects';

import { PersonsListComponent } from './persons-list/persons-list.component';
import { PersonDetailsComponent } from './person-details/person-details.component';
import { PersonsAddComponent } from './persons-add/persons-add.component';

import { PersonGeneralTabComponent } from './person-details/person-general-tab/person-general-tab.component';
import { PersonAddressTabComponent } from './person-details/person-address-tab/person-address-tab.component';
import { PersonContactsTabComponent } from './person-details/person-contacts-tab/person-contacts-tab.component';

import { ContactListComponent } from './contacts/contact-list/contact-list.component';
import { ContactsEditComponent } from './contacts/contacts-edit/contacts-edit.component';
import { ContactListActionsRendererComponent } from './contacts/contact-list/contact-list-actions-renderer/contact-list-actions-renderer.component';
import { PersonsRoutingModule } from './persons-routing.module';
import { ContactsLinkExistingComponent } from './contacts/contacts-link-existing/contacts-link-existing.component';
import { PersonOverviewSectionComponent } from './person-details/person-overview/person-overview-section.component';
import { ContactsPersonTemplateComponent } from './contacts/contacts-person-template/contacts-person-template.component';
import { ContactsLinkPersonListComponent } from './contacts/contacts-link-existing/person-list/person-list.component';
import { ContactsDuplicateWarnComponent } from './contacts/contacts-duplicate-warn/contacts-duplicate-warn.component';

@NgModule({
  declarations: [
    PersonsListComponent,
    PersonDetailsComponent,
    PersonGeneralTabComponent,
    PersonAddressTabComponent,
    PersonContactsTabComponent,
    ContactListComponent,
    PersonsAddComponent,
    ContactsEditComponent,
    ContactsDuplicateWarnComponent,
    ContactListActionsRendererComponent,
    ContactsLinkExistingComponent,
    ContactsPersonTemplateComponent,
    PersonOverviewSectionComponent,
    ContactsLinkPersonListComponent,
  ],
  providers: [provideNgxMask()],
  exports: [
    ContactListComponent,
    PersonGeneralTabComponent,
    PersonContactsTabComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    SharedModule,
    AddressesModule,
    PersonsRoutingModule,
    ModalModule.forRoot(),
    AgGridModule,
    StoreModule.forFeature('persons_feature', PersonReducer),
    StoreModule.forFeature('contacts_feature', ContactsReducer),
    EffectsModule.forFeature([
      PersonsEffects,
      ContactsEffects,
    ]),
    NgxMaskDirective, NgxMaskPipe,
  ],
})
export class PersonsModule {
}
