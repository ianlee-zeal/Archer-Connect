import { Routes, RouterModule, Route } from '@angular/router';
import { NgModule } from '@angular/core';
import * as uuid from 'uuid';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { SubTasksListComponent } from '@app/modules/shared/tasks/sub-tasks-list/sub-tasks-list.component';
import { TaskManagementEntityEnum } from '@app/models/enums/task-management-entity.enum';
import { TaskTemplatesListComponent } from './task-templates-list/task-templates-list.component';
import { TemplateDetailsSectionComponent } from './template-details-section/template-details-section.component';
import { TemplateDetailsPageComponent } from './template-details-page/template-details-page.component';

const taskTemplateChildren = (permissions: string[]): Route => ({
  children: [
    {
      path: '',
      component: TemplateDetailsSectionComponent,
      children: [
        { path: '', pathMatch: 'full', redirectTo: 'tabs' },
        {
          path: 'tabs',
          children: [
            { path: '', pathMatch: 'full', redirectTo: 'sub-tasks' },
            { path: 'sub-tasks', component: SubTasksListComponent, data: { parentComponent: TaskManagementEntityEnum.Template, permissions } },
          ],
        },
      ],
    },
  ],
});

const routes: Routes = [
  {
    path: '',
    component: TaskTemplatesListComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Read)] },
  },
  {
    path: 'new',
    data: { componentId: uuid.v4() },
    component: TemplateDetailsPageComponent,
    ...taskTemplateChildren([PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Create)]),
  },
  {
    path: ':id',
    data: { componentId: uuid.v4() },
    component: TemplateDetailsPageComponent,
    ...taskTemplateChildren([PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Read)]),
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaskTemplatesRoutingModule { }
