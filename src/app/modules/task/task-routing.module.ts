import { NgModule } from '@angular/core';
import { Routes, RouterModule, Route } from '@angular/router';
import * as uuid from 'uuid';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { TaskManagementEntityEnum } from '@app/models/enums/task-management-entity.enum';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { TasksSectionComponent } from './task-section.component';
import { TaskDetailsPageComponent } from './task-management/task-details-page/task-details-page.component';
import { TaskDetailsSectionComponent } from './task-management/task-details-section/task-details-section.component';
import { SubTasksListComponent } from '../shared/tasks/sub-tasks-list/sub-tasks-list.component';
import { TaskManagementDashboardComponent } from './task-management/task-management-dashboard/task-management-dashboard.component';
import { TaskRelatedDocumentsComponent } from './task-management/task-related-documents/task-related-documents.component';

const taskManagementChildren = (permissions: string[]): Route => ({
  children: [
    {
      path: '',
      component: TaskDetailsSectionComponent,
      children: [
        { path: '', pathMatch: 'full', redirectTo: 'tabs' },
        {
          path: 'tabs',
          children: [
            { path: '', pathMatch: 'full', redirectTo: 'sub-tasks' },
            { path: 'sub-tasks', component: SubTasksListComponent, data: { parentComponent: TaskManagementEntityEnum.Task, permissions } },
            { path: 'related-documents', component: TaskRelatedDocumentsComponent, data: { parentComponent: TaskManagementEntityEnum.Task, permissions } },
          ],
        },
      ],
    },
  ],
});

const routes: Routes = [
  {
    path: '',
    component: TasksSectionComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tabs' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'task-management' },
          {
            path: 'task-management',
            component: TaskManagementDashboardComponent,
            canActivate: [PermissionGuard],
          },
        ],
      },
    ],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Read),
      ],
    },
  },
  {
    path: 'task-management/new',
    data: { componentId: uuid.v4() },
    component: TaskDetailsPageComponent,
    ...taskManagementChildren([PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Create)]),
  },
  {
    path: 'task-management/:id',
    data: { componentId: uuid.v4() },
    component: TaskDetailsPageComponent,
    ...taskManagementChildren([PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Read)]),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaskRoutingModule { }
