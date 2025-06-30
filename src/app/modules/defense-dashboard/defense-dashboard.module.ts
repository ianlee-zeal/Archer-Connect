import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { SharedModule } from '@app/modules/shared/shared.module';
import { DefenseDashboardRoutingModule } from './defense-dashboard-routing.module';
import { DefenseDashboardComponent } from './defense-dashboard/defense-dashboard.component';
import { PowerBIEmbedModule } from 'powerbi-client-angular';

@NgModule({
  declarations: [
    DefenseDashboardComponent,

  ],
  imports: [
    CommonModule,
    SharedModule,
    DefenseDashboardRoutingModule,
    AgGridModule,
    PowerBIEmbedModule,
  ],
})
export class DefenseDashboardModule { }
