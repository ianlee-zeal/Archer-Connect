import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as uuid from 'uuid';

import { CanDeactivateGuard } from '@app/modules/shared/_guards/can-deactivate.guard';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { PersonGeneralTabComponent } from './person-details/person-general-tab/person-general-tab.component';
import { PersonAddressTabComponent } from './person-details/person-address-tab/person-address-tab.component';
import { PersonContactsTabComponent } from './person-details/person-contacts-tab/person-contacts-tab.component';
import { PersonsListComponent } from './persons-list/persons-list.component';
import { PersonDetailsComponent } from './person-details/person-details.component';
import { PersonOverviewSectionComponent } from './person-details/person-overview/person-overview-section.component';

const routes: Routes = [
  {
    path: '',
    component: PersonsListComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.GlobalPersonSearch, PermissionActionTypeEnum.Read),
        PermissionService.create(PermissionTypeEnum.Persons, PermissionActionTypeEnum.Read),
      ],
    },
  },
  {
    path: ':id',
    component: PersonDetailsComponent,
    data: { componentId: uuid.v4() },
    children: [
      {
        path: '',
        component: PersonOverviewSectionComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'tabs' },
          {
            path: 'tabs',
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'details' },
              {
                path: 'details',
                component: PersonGeneralTabComponent,
                canDeactivate: [CanDeactivateGuard],
                canActivate: [PermissionGuard],
                data: {
                  permissions: [
                    PermissionService.create(PermissionTypeEnum.GlobalPersonSearch, PermissionActionTypeEnum.Read),
                    PermissionService.create(PermissionTypeEnum.Persons, PermissionActionTypeEnum.Read),
                  ],
                },
              },
              {
                path: 'addresses',
                component: PersonAddressTabComponent,
                canActivate: [PermissionGuard],
                data: { permissions: PermissionService.create(PermissionTypeEnum.PersonAddresses, PermissionActionTypeEnum.Read) },
              },
              {
                path: 'contacts',
                component: PersonContactsTabComponent,
                canActivate: [PermissionGuard],
                data: { permissions: PermissionService.create(PermissionTypeEnum.ClientContact, PermissionActionTypeEnum.Read) },
              },
            ],
          },
        ],
      },

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonsRoutingModule { }
