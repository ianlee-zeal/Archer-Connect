import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ModalModule } from 'ngx-bootstrap/modal';

import { SharedModule } from '@shared/shared.module';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
// Import FusionCharts library
import { FusionChartsModule } from 'angular-fusioncharts';
import * as FusionCharts from 'fusioncharts';
import * as Charts from 'fusioncharts/fusioncharts.charts';
import * as FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';

import { SettlementReducer } from './state/reducer';
import { SettlementsEffects } from './state/effects';

import { SettlementsListComponent } from './settlements-list/settlements-list.component';
import { SettlementInfoComponent } from './settlement-info/settlement-info.component';
import { SettlementDetailsComponent } from './settlement-details/settlement-details.component';
import { SettlementsAddComponent } from './settlements-add/settlements-add.component';
import { SettlementInfoTabComponent } from './settlement-details/settlement-info-tab/settlement-info-tab.component';
import { SettlementNotesTabComponent } from './settlement-details/settlement-notes-tab/settlement-notes-tab.component';
import { SettlementDocumentsTabComponent } from './settlement-details/settlement-documents-tab/settlement-documents-tab.component';
import { SettlementProjectsTabComponent } from './settlement-details/settlement-projects-tab/settlement-projects-tab.component';
import { SettlementClaimantsTabComponent } from './settlement-details/settlement-claimants-tab/settlement-claimants-tab.component';
import { SettlementsRoutingModule } from './settlements-routing.module';
import { SettlementOverviewSectionComponent } from './settlement-details/settlement-overview/settlement-overview-section.component';
import { FinancialSummaryTabComponent } from './settlement-details/financial-summary-tab/financial-summary-tab.component';
import { FinancialSummaryCharts } from './financial-summary-charts/financial-summary-charts.component';
import { FinancialSummaryData } from './financial-summary-data/financial-summary-data.component';

FusionChartsModule.fcRoot(FusionCharts, Charts, FusionTheme);

@NgModule({
  declarations: [
    SettlementsListComponent,
    SettlementInfoComponent,
    SettlementDetailsComponent,
    SettlementInfoTabComponent,
    SettlementNotesTabComponent,
    SettlementDocumentsTabComponent,
    SettlementProjectsTabComponent,
    SettlementClaimantsTabComponent,
    FinancialSummaryTabComponent,
    SettlementsAddComponent,
    SettlementOverviewSectionComponent,
    FinancialSummaryCharts,
    FinancialSummaryData,
  ],
  providers: [provideNgxMask()],
  exports: [
    SettlementInfoTabComponent,
    SettlementNotesTabComponent,
    SettlementDocumentsTabComponent,
    SettlementProjectsTabComponent,
    SettlementClaimantsTabComponent,
    FinancialSummaryTabComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    SharedModule,
    FusionChartsModule,
    SettlementsRoutingModule,
    ModalModule.forRoot(),
    AgGridModule,
    StoreModule.forFeature('settlements_feature', SettlementReducer),
    EffectsModule.forFeature([
      SettlementsEffects,
    ]),
    NgxMaskDirective, NgxMaskPipe,
  ],
})
export class SettlementsModule {
}
