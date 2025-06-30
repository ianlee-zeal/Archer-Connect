import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '../shared/shared.module';
import { ProductWorkflowReducer, FEATURE_NAME } from './state/reducers';
import { ProductWorkflowEffects } from './state/effects';

@NgModule({
  declarations: [
  ],
  exports: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    SharedModule,
    StoreModule.forFeature(FEATURE_NAME, ProductWorkflowReducer),
    EffectsModule.forFeature([
      ProductWorkflowEffects,
    ]),
  ],
})
export class ProductWorkflowModule { }
