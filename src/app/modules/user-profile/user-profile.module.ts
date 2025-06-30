import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { UserProfileRoutingModule } from './user-profile-routing.module';
import { SharedModule } from '../shared/shared.module';
import { UserProfileGeneralTabComponent } from './user-profile-general-tab/user-profile-general-tab.component';
import { reducer as UserProfileReducer } from './state/reducer';
import { UserProfileDetailsComponent } from './user-profile-details/user-profile-details.component';
import { UserProfileSideNavComponent } from './user-side-nav/user-profile-side-nav.component';
import { UserProfileLogInHistoryTabComponent } from './user-profile-log-in-history-tab/user-profile-log-in-history-tab.component';
import { UserProfileTasksComponent } from './user-profile-tasks/user-profile-tasks.component';
import { UserProfileEffects } from './state/effects';
import { UserProfileRolesTabComponent } from './user-profile-roles-tab/user-profile-roles-tab.component';
import { UserProfileSubscriptionsTabComponent } from './user-profile-subscriptions-tab/user-profile-subscriptions-tab.component';
import { SecuritySettingsComponent } from './security-settings/security-settings.component';
import { TrustedDeviceListComponent } from './trusted-device-list/trusted-device-list.component';
import { UserProfileSectionComponent } from './user-profile-section/user-profile-section.component';
import { UserProfilePermissionsComponent } from './user-profile-permissions/user-profile-permissions.component';
import { AdminModule } from '../admin/admin.module';
import { UserPermissionsSectionComponent } from './user-profile-section/user-permissions-section.component';
import { UserProfilePermissionsSideNavComponent } from './user-side-nav/user-profile-permissioms-side-nav.component';

@NgModule({
  declarations: [
    UserProfileGeneralTabComponent,
    UserProfileDetailsComponent,
    UserProfileLogInHistoryTabComponent,
    UserProfileSideNavComponent,
    UserProfileTasksComponent,
    UserProfileRolesTabComponent,
    SecuritySettingsComponent,
    UserProfileRolesTabComponent,
    UserProfileSubscriptionsTabComponent,
    TrustedDeviceListComponent,
    UserProfileSectionComponent,
    UserProfilePermissionsComponent,
    UserPermissionsSectionComponent,
    UserProfilePermissionsSideNavComponent,
  ],
  providers: [provideNgxMask()],
  imports: [
    UserProfileRoutingModule,
    SharedModule,
    CommonModule,
    AdminModule,
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    NgxMaskDirective, NgxMaskPipe,
    StoreModule.forFeature('user-profile', UserProfileReducer),
    EffectsModule.forFeature([
      UserProfileEffects,
    ]),
  ],
})
export class UserProfileModule { }
