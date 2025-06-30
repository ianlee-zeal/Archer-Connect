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
import { TaskTemplatesEffects } from './state/effects';
import { TaskTemplatesRoutingModule } from './task-templates-routing.module';
import { TaskTemplatesListComponent } from './task-templates-list/task-templates-list.component';
import { featureName } from './state/actions';
import { ActionPanelButtonsRendererComponent } from './renderers/action-panel-buttons-renderer/action-panel-buttons-renderer.component';
import { TemplateDetailsPageComponent } from './template-details-page/template-details-page.component';
import { TemplateDetailsSectionComponent } from './template-details-section/template-details-section.component';

@NgModule({
  declarations: [
    TaskTemplatesListComponent,
    ActionPanelButtonsRendererComponent,
    TemplateDetailsPageComponent,
    TemplateDetailsSectionComponent,
  ],
  providers: [provideNgxMask()],
  exports: [],
  imports: [
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    CommonModule,
    SharedModule,
    TaskTemplatesRoutingModule,
    ModalModule.forRoot(),
    AgGridModule,
    StoreModule.forFeature(featureName, reducer),
    EffectsModule.forFeature([TaskTemplatesEffects]),
    NgxMaskDirective, NgxMaskPipe,
  ],
})
export class TaskTemplatesModule { }
