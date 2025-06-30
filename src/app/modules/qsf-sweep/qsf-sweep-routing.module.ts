import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as uuid from 'uuid';
import { PermissionGuard } from '../auth/permission-guard';
import { QsfSweepBatchListComponent } from './qsf-sweep-batch-list/qsf-sweep-batch-list.component';
import { QsfSweepResultListComponent } from './qsf-sweep-result-list/qsf-sweep-result-list.component';

const routes: Routes = [
  {
    path: '',
    component: QsfSweepBatchListComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectQSFSweep, PermissionActionTypeEnum.Read)] },
  },

  {
    path: ':id',
    component: QsfSweepResultListComponent,
    canActivate: [PermissionGuard],
    data: {
      componentId: uuid.v4(),
      permissions: [PermissionService.create(PermissionTypeEnum.ProjectQSFSweep, PermissionActionTypeEnum.Read)],
    },
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QsfSweepRoutingModule { }
