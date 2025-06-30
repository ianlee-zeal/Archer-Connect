import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FusionChartsModule } from 'angular-fusioncharts';

import * as FusionCharts from 'fusioncharts';
import * as charts from 'fusioncharts/fusioncharts.charts';
import * as FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';

import { SharedModule } from '@shared/shared.module';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ModalService } from '@app/services';
import { TaskReducer } from './state/reducer';
import { TasksEffects } from './state/effects';

import { TaskManagementListComponent } from './task-management/task-management-list/task-management-list.component';
import { TaskRoutingModule } from './task-routing.module';
import { TasksSectionComponent } from './task-section.component';
import { TaskDetailsPageComponent } from './task-management/task-details-page/task-details-page.component';
import { TaskDetailsSectionComponent } from './task-management/task-details-section/task-details-section.component';
import { TaskManagementDashboardComponent } from './task-management/task-management-dashboard/task-management-dashboard.component';
import { TaskManagementDashboardLegendComponent } from './task-management/task-management-dashboard/task-management-dashboard-legend/task-management-dashboard-legend.component';
import { TaskManagementDashboardOverdueTasksWidgetComponent } from './task-management/task-management-dashboard/widgets/task-management-dashboard-overdue-tasks-widget/task-management-dashboard-overdue-tasks-widget.component';
import { ActionPanelButtonsRendererComponent } from '../shared/tasks/renderers/action-panel-buttons-renderer/action-panel-buttons-renderer.component';
import { TaskRelatedDocumentsComponent } from './task-management/task-related-documents/task-related-documents.component';
import { TaskManagementDashboardAgingWidgetComponent } from './task-management/task-management-dashboard/widgets/task-management-dashboard-aging-widget/task-management-dashboard-aging-widget.component';

FusionChartsModule.fcRoot(FusionCharts, charts, FusionTheme);
@NgModule({
  declarations: [
    TasksSectionComponent,
    TaskManagementListComponent,
    TaskDetailsPageComponent,
    TaskDetailsSectionComponent,
    TaskManagementDashboardComponent,
    TaskManagementDashboardLegendComponent,
    TaskManagementDashboardOverdueTasksWidgetComponent,
    ActionPanelButtonsRendererComponent,
    TaskRelatedDocumentsComponent,
    TaskManagementDashboardAgingWidgetComponent,
  ],
  providers: [ModalService, provideNgxMask()],
  exports: [],
  imports: [
    CommonModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    SharedModule,
    TaskRoutingModule,
    FusionChartsModule,
    ModalModule.forRoot(),
    AgGridModule,
    StoreModule.forFeature('task_feature', TaskReducer),
    EffectsModule.forFeature([
      TasksEffects,
    ]),
    NgxMaskDirective, NgxMaskPipe,
  ],
})
export class TaskModule {
}
