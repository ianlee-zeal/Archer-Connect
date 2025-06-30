import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import * as uuid from 'uuid';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { WorkflowCommandsListComponent } from './workflow-commands-list/workflow-commands-list.component';
import { WorkflowCommandsPageComponent } from './workflow-commands-page/workflow-commands-page.component';

const routes: Routes = [
  {
    path: '',
    component: WorkflowCommandsListComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.WorkflowCommands, PermissionActionTypeEnum.Read)] },
  },
  {
    path: 'new',
    data: { componentId: uuid.v4() },
    component: WorkflowCommandsPageComponent,
  },
  {
    path: ':id',
    data: { componentId: uuid.v4() },
    component: WorkflowCommandsPageComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowCommandsRoutingModule { }
