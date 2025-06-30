import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { PermissionGuard } from '../auth/permission-guard';
import { ANDIMessagingSectionComponent } from './andi-messaging-section/andi-messaging-section.component';
import { InboxComponent } from './inbox/inbox.component';
import { MessageViewComponent } from './message-view/message-view.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {path: '', pathMatch: 'full', redirectTo: 'tabs'},
            {path: 'tabs',
                component: ANDIMessagingSectionComponent,
                children: [
                    {path: '', pathMatch: 'full', redirectTo: 'inbox'},
                    {path: 'inbox',
                        component: InboxComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            permissions: [ PermissionService.create(PermissionTypeEnum.ANDIMessaging, PermissionActionTypeEnum.Read)],
                        }
                    }
                ]
            },
            {path: 'message/:id',
                component: MessageViewComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [ PermissionService.create(PermissionTypeEnum.ANDIMessaging, PermissionActionTypeEnum.Read)],
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommunicationHubRoutingModule { }