import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as uuid from 'uuid';
import { ProjectDeficienciesGridComponent } from './project-deficiencies-grid/project-deficiencies-grid.component';
import { ProjectDeficienciesTemplateDetailsSectionComponent } from './project-deficiencies-details/project-deficiencies-details-section.component';
import { ProjectDeficienciesTemplateDetailsComponent } from './project-deficiencies-details/details-component/project-deficiencies-details.component';
import { ProjectDeficienciesConfigOldComponent } from './project-deficiencies-details-old/project-deficiencies-config.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectDeficienciesGridComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.ManageDeficienciesSettingsTemplates)] },
  },
  {
    path: 'old-details',
    pathMatch: 'full',
    component: ProjectDeficienciesTemplateDetailsSectionComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [
      PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.Read),
    ] },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ProjectDeficienciesConfigOldComponent,
      },
    ],
  },
  {
    path: 'details',
    component: ProjectDeficienciesTemplateDetailsSectionComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.Read)],
      componentId: uuid.v4(),
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'action/new',
      },
      { path: 'action/:action', pathMatch: 'full', component: ProjectDeficienciesTemplateDetailsComponent },
      { path: 'action/:action/:id', pathMatch: 'full', component: ProjectDeficienciesTemplateDetailsComponent },
    ],
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectDeficienciesSettingRoutingModule { }
