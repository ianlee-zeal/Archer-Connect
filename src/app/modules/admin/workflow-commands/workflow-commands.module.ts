import { NgModule } from '@angular/core';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AgGridModule } from 'ag-grid-angular';
import { SharedModule } from '@app/modules/shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { reducer } from './state/reducer';
import { WorkflowCommandsEffects } from './state/effects';
import { featureName } from './state/actions';
import { ActionPanelButtonsRendererComponent } from './renderers/action-panel-buttons-renderer/action-panel-buttons-renderer.component';
import { WorkflowCommandsPageComponent } from './workflow-commands-page/workflow-commands-page.component';
import { WorkflowCommandsListComponent } from './workflow-commands-list/workflow-commands-list.component';
import { WorkflowCommandsRoutingModule } from './workflow-commands-routing.module';

@NgModule({
  declarations: [
    WorkflowCommandsListComponent,
    ActionPanelButtonsRendererComponent,
    WorkflowCommandsPageComponent,
  ],
  providers: [provideNgxMask()],
  exports: [],
  imports: [
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    CommonModule,
    SharedModule,
    WorkflowCommandsRoutingModule,
    ModalModule.forRoot(),
    AgGridModule,
    StoreModule.forFeature(featureName, reducer),
    EffectsModule.forFeature([WorkflowCommandsEffects]),
    NgxMaskDirective, NgxMaskPipe,
  ],
})
export class WorkflowCommandsModule { }
