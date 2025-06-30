import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';
import { FirmLandingPageComponent } from '@app/modules/firm-landing-page/firm-landing-page.component';
import { FirmLandingPageRoutingModule } from '@app/modules/firm-landing-page/firm-landing-page-routing.module';
import { StoreModule } from '@ngrx/store';
import { reducer } from '@app/modules/admin/state/reducer';
import { EffectsModule } from '@ngrx/effects';
import { UsersEffects } from '@app/modules/admin/user-access-policies/users/state/effects';
import { LandingPageGlobalSearchComponent } from '@app/modules/firm-landing-page/landing-page-global-search/landing-page-global-search.component';
import { FormsModule } from '@angular/forms';
import { FirmLandingPageReducer } from './state/reducer';
import { FirmLandingPageEffects } from './state/effects';
import {
  GlobalDeficienciesComponent
} from '@app/modules/firm-landing-page/global-deficiencies/global-deficiencies.component';


@NgModule({
  declarations: [
    FirmLandingPageComponent,
    LandingPageGlobalSearchComponent,
    GlobalDeficienciesComponent
  ],
  exports: [
    LandingPageGlobalSearchComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FirmLandingPageRoutingModule,
    StoreModule.forFeature('admin_feature', reducer),
    StoreModule.forFeature('firm_landing_page_feature', FirmLandingPageReducer),
    EffectsModule.forFeature([
      UsersEffects,
      FirmLandingPageEffects
    ]),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' })
  ]
})
export class FirmLandingPageModule {
}
