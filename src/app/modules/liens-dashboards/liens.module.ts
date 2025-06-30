import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { FusionChartsModule } from 'angular-fusioncharts';

import { SharedModule } from '../shared/shared.module';
import { reducer } from './state/reducer';
import { FEATURE_NAME } from './state';
import { LiensRoutingModule } from './liens-routing.module';

import { ProbateDashboardComponent } from './probate-dashboard/probate-dashboard.component';
import { ProbateDashboardEffects } from './probate-dashboard/state/effects';
import { DashboardClaimantsListComponent } from '../liens-dashboards/dashboard-claimants-list/dashboard-claimants-list.component';
import { DashboardClaimantsListEffects } from './dashboard-claimants-list/state/effects';

import { ReleaseDashboardComponent } from './release-dashboard/release-dashboard.component';
import { ReleaseDashboardEffects } from './release-dashboard/state/effects';
import { ReleaseDashboardClaimantsListComponent } from './release-dashboard-claimants-list/release-dashboard-claimants-list.component';
import { ReleaseDashboardClaimantsListEffects } from './release-dashboard-claimants-list/state/effects';

import { BankruptcyDashboardComponent } from './bankruptcy-dashboard/bankruptcy-dashboard.component';
import { BankruptcyDashboardEffects } from './bankruptcy-dashboard/state/effects';
import { BankruptcyDashboardClaimantsListComponent } from './bankruptcy-dashboard-claimants-list/bankruptcy-dashboard-claimants-list.component';
import { BankruptcyDashboardClaimantsListEffects } from './bankruptcy-dashboard-claimants-list/state/effects';

import { LienResolutionDashboardComponent } from './lien-resolution-dashboard/lien-resolution-dashboard.component';
import { LienResolutionDashboardEffects } from './lien-resolution-dashboard/state/effects';
import { LienResolutionDashboardClaimantsListComponent } from './lien-resolution-dashboard-claimants-list/lien-resolution-dashboard-claimants-list.component';
import { LienResolutionDashboardClaimantsListEffects } from './lien-resolution-dashboard-claimants-list/state/effects';

import { QsfAdminDashboardComponent } from './qsf-admin-dashboard/qsf-admin-dashboard.component';
import { QsfAdminDashboardEffects } from './qsf-admin-dashboard/state/effects';
import { QsfAdminDashboardClaimantsListComponent } from './qsf-admin-dashboard-claimants-list/qsf-admin-dashboard-claimants-list.component';
import { QsfAdminDashboardClaimantsListEffects } from './qsf-admin-dashboard-claimants-list/state/effects';
import { ClaimsPowerBIComponent } from './claims-power-bi/claims-power-bi.component';
import { PowerBIEmbedModule } from 'powerbi-client-angular';
import { ReleaseDashboardChartsComponent } from './release-dashboard/release-dashboard-charts/release-dashboard-charts.component';
import { LienResolutionDashboardChartsComponent } from './lien-resolution-dashboard/lien-resolution-dashboard-charts/lien-resolution-dashboard-charts.component';
import { BankruptcyDashboardChartsComponent } from './bankruptcy-dashboard/bankruptcy-dashboard-charts/bankruptcy-dashboard-charts.component';
import { ProbateDashboardChartsComponent } from './probate-dashboard/probate-dashboard-charts/probate-dashboard-charts.component';
import { QsfAdminDashboardChartsComponent } from './qsf-admin-dashboard/qsf-admin-dashboard-charts/qsf-admin-dashboard-charts..component';

@NgModule({
  declarations: [
    DashboardClaimantsListComponent,
    ProbateDashboardComponent,
    ReleaseDashboardClaimantsListComponent,
    ReleaseDashboardComponent,
    BankruptcyDashboardClaimantsListComponent,
    BankruptcyDashboardComponent,
    ClaimsPowerBIComponent,
    LienResolutionDashboardClaimantsListComponent,
    LienResolutionDashboardComponent,
    QsfAdminDashboardComponent,
    QsfAdminDashboardClaimantsListComponent,
    ReleaseDashboardChartsComponent,
    LienResolutionDashboardChartsComponent,
    BankruptcyDashboardChartsComponent,
    ProbateDashboardChartsComponent,
    QsfAdminDashboardChartsComponent,
  ],
  exports: [
    DashboardClaimantsListComponent,
    ProbateDashboardComponent,
    ReleaseDashboardClaimantsListComponent,
    ReleaseDashboardComponent,
    BankruptcyDashboardClaimantsListComponent,
    BankruptcyDashboardComponent,
    ClaimsPowerBIComponent,
    LienResolutionDashboardClaimantsListComponent,
    LienResolutionDashboardComponent,
    QsfAdminDashboardComponent,
    QsfAdminDashboardClaimantsListComponent,
    ReleaseDashboardChartsComponent,
    LienResolutionDashboardChartsComponent,
    BankruptcyDashboardChartsComponent,
    ProbateDashboardChartsComponent,
    QsfAdminDashboardChartsComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    SharedModule,
    LiensRoutingModule,
    FusionChartsModule,
    StoreModule.forFeature(FEATURE_NAME, reducer),
    EffectsModule.forFeature([
      DashboardClaimantsListEffects,
      ProbateDashboardEffects,
      ReleaseDashboardClaimantsListEffects,
      ReleaseDashboardEffects,
      BankruptcyDashboardClaimantsListEffects,
      BankruptcyDashboardEffects,
      LienResolutionDashboardClaimantsListEffects,
      LienResolutionDashboardEffects,
      QsfAdminDashboardEffects,
      QsfAdminDashboardClaimantsListEffects,
    ]),
    PowerBIEmbedModule
  ],
})
export class LiensModule { }
