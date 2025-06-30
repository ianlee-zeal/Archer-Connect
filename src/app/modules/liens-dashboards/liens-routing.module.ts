import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LienResolutionDashboardComponent } from './lien-resolution-dashboard/lien-resolution-dashboard.component';

const routes: Routes = [
  { path: '', component: LienResolutionDashboardComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LiensRoutingModule { }
