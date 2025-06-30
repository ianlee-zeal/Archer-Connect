import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { AgGridModule } from 'ag-grid-angular';
import { SharedModule } from '@app/modules/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { reducer } from './state/reducers';
import { ProjectDeficienciesSettingRoutingModule } from './project-deficiencies-setting-routing.module';

import { FEATURE_NAME } from './state';
import { ProjectDeficienciesGridComponent } from './project-deficiencies-grid/project-deficiencies-grid.component';
import { ProjectDeficienciesActionsRendererComponent } from './project-deficiencies-grid/project-deficiencies-actions-renderer/project-deficiencies-actions-renderer.component';
import { DeficiencySettingsTemplatesEffects } from './project-deficiencies-grid/state/effects';
import { ProjectDeficienciesTemplateDetailsComponent } from './project-deficiencies-details/details-component/project-deficiencies-details.component';
import { SeverityStatusRendererComponent } from './project-deficiencies-details/severity-status-renderer/severity-status-renderer.component';
import { DeficienciesTemplateDetailsEffects } from './project-deficiencies-details/state/effects';
import { ProjectDeficienciesSettingsListComponent } from './project-deficiencies-details/deficiencies-settings-list/deficiencies-settings-list.component';
import { ProjectDeficienciesTemplateFormComponent } from './project-deficiencies-details/deficiencies-settings-form/deficiencies-settings-form.component';
import { ProjectDeficienciesTemplateDetailsSectionComponent } from './project-deficiencies-details/project-deficiencies-details-section.component';
import { ProjectDeficienciesConfigOldComponent } from './project-deficiencies-details-old/project-deficiencies-config.component';

@NgModule({
  declarations: [
    ProjectDeficienciesTemplateDetailsComponent,
    ProjectDeficienciesSettingsListComponent,
    SeverityStatusRendererComponent,
    ProjectDeficienciesGridComponent,
    ProjectDeficienciesActionsRendererComponent,
    ProjectDeficienciesTemplateFormComponent,
    ProjectDeficienciesTemplateDetailsSectionComponent,
    ProjectDeficienciesConfigOldComponent,
  ],
  imports: [
    CommonModule,
    ProjectDeficienciesSettingRoutingModule,
    SharedModule,
    AgGridModule,
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    StoreModule.forFeature(FEATURE_NAME, reducer),
    EffectsModule.forFeature([
      DeficienciesTemplateDetailsEffects,
      DeficiencySettingsTemplatesEffects,
    ]),
  ],
})
export class ProjectDeficienciesSettingModule { }
