import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '../shared/shared.module';
import { documentTemplatesReducerWrapper } from './state/reducer';
import { DocumentTemplatesEffects } from './state/effects';
import { DocumentTemplatesRoutingModule } from './document-templates-routing.module';
import { DocumentTemplatesPageComponent } from './document-templates-page/document-templates-page.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature('document-templates_feature', documentTemplatesReducerWrapper),
    EffectsModule.forFeature([DocumentTemplatesEffects]),
    DocumentTemplatesRoutingModule,
  ],
  declarations: [DocumentTemplatesPageComponent],
})
export class DocumentTemplatesModule { }
