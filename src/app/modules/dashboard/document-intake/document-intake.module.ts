import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '@shared/shared.module';
import { DocumentIntakeReducer } from './state/reducer';
import { DocumentIntakeEffects } from './state/effects';
import { DocumentIntakeListComponent } from './document-intake-list/document-intake-list.component';
import { DocumentIntakeRoutingModule } from './document-intake-routing.module';
import { DocumentIntakeComponent } from './document-intake/document-intake.component';
import { DocumentIntakeRendererComponent } from './renderers/document-intake-buttons-renderer';

@NgModule({
  declarations: [
    DocumentIntakeComponent,
    DocumentIntakeListComponent,
    DocumentIntakeRendererComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    DocumentIntakeRoutingModule,
    AgGridModule,
    StoreModule.forFeature('document_intake_feature', DocumentIntakeReducer),
    EffectsModule.forFeature([
      DocumentIntakeEffects,
    ]),
  ],
})
export class DocumentIntakeModule {
}
