import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { PermissionGuard } from '../auth/permission-guard';
import { ProbatesListComponent } from './probates-list/probates-list.component';

const routes: Routes = [
  {
    path: '',
    component: ProbatesListComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.GlobalProbateSearch, PermissionActionTypeEnum.Read),
      ],
    },
  },
  {
    path: 'saved-search',
    children: [
      {
        path: ':id',
        component: ProbatesListComponent,
        canActivate: [PermissionGuard],
        data: {
          permissions: [
            PermissionService.create(PermissionTypeEnum.GlobalProbateSearch, PermissionActionTypeEnum.Read),
          ],
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProbatesRoutingModule { }
