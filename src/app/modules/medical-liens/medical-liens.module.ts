import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { sharedReducer } from './state/shared.reducer';
import { sharedEffects } from './state/shared.effects';
import { FEATURE_NAME } from './state/shared.state';
import { SharedModule } from '../shared/shared.module';
import { MedicalLiensListComponent } from './medical-liens-list/medical-liens-list.component';
import { MedicalLiensActionPanelRendererComponent } from './renderers/action-panel-renderer/medical-liens-action-panel-renderer';

@NgModule({
  declarations: [
    MedicalLiensListComponent,
    MedicalLiensActionPanelRendererComponent,
  ],
  exports: [
    MedicalLiensListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    SharedModule,
    AgGridModule,
    StoreModule.forFeature(FEATURE_NAME, sharedReducer),
    EffectsModule.forFeature([...sharedEffects]),
  ],
})

export class MedicalLiensModule { }
