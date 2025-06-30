import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermissionGuard } from '../auth/permission-guard';
import { SavedSearchesListComponent } from './saved-searches-list/saved-searches-list.component';

const routes: Routes = [
  {
    path: '',
    component: SavedSearchesListComponent,
    canActivate: [PermissionGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SavedSearchesRoutingModule { }
