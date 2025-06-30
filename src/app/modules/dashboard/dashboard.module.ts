import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { reducer } from './state/reducer';
import { DashboardEffects } from './state/effects';

import { SharedModule } from '../shared/shared.module';

import { DashboardIndexComponent } from './dashboard-index/dashboard-index.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SafePipe } from './safe.pipe';

@NgModule({
  declarations: [
    DashboardIndexComponent,
    SafePipe,
  ],
  providers: [SafePipe],
  exports: [SafePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    DashboardRoutingModule,
    SharedModule,
    AgGridModule,
    StoreModule.forFeature('dashboard_feature', reducer),
    EffectsModule.forFeature([DashboardEffects]),
  ],
})
export class DashboardModule { }
