import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionService } from '@app/services';
import { GlobalCommunicationSearch } from './global-communication-search.component/global-communication-search.component';

const routes: Routes = [
  {
    path: '',
    component: GlobalCommunicationSearch,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.GlobalCommunicationSearch, PermissionActionTypeEnum.Read),
        PermissionService.create(PermissionTypeEnum.Communications, PermissionActionTypeEnum.Read),
      ],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GlobalCommunicationSearchRoutingModule { }
