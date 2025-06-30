import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ModalModule } from 'ngx-bootstrap/modal';

import { SharedModule } from '@shared/shared.module';
import { RolesEffects } from './state/effects';
import { OrganizationRoleReducer } from './state/reducers';


import { RolesRoutingModule } from './roles-routing.module';
import { RolesDetailComponent } from './roles-detail/roles-detail.component';
import { RoleDetailsTabComponent } from './roles-detail/role-details-tab/role-details-tab.component';
import { RolesAddNewModalComponent } from './roles-add-new-modal/roles-add-new-modal.component';

@NgModule({
    declarations: [
        RolesDetailComponent,
        RoleDetailsTabComponent,
        RolesAddNewModalComponent
    ],
    providers: [],
    exports: [],
    imports: [
        CommonModule,
        ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        SharedModule,
        RolesRoutingModule,
        ModalModule.forRoot(),
        AgGridModule,
        StoreModule.forFeature('org-roles_feature', OrganizationRoleReducer),
        EffectsModule.forFeature([
            RolesEffects,
        ]),
    ]
})
export class RolesModule {
}
