import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { SharedModule } from '@app/modules/shared/shared.module';
import { TortDashboardRoutingModule } from './tort-dashboard-routing.module';
import { TortDashboardComponent } from './tort-dashboard/tort-dashboard.component';
import { PowerBIEmbedModule } from 'powerbi-client-angular';

@NgModule({
  declarations: [
    TortDashboardComponent,

  ],
  imports: [
    CommonModule,
    SharedModule,
    TortDashboardRoutingModule,
    AgGridModule,
    PowerBIEmbedModule,
  ],
})
export class TortDashboardModule { }
