import { SharedModule } from '@shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { DocumentsComponent } from './documents.component';
import { DocumentsSearchComponent } from './documents-search/documents-search.component';
import { DocumentTypesReducer } from './state/reducer';
import { DocumentsEffects } from './state/effects';
import { DocumentsRoutingModule } from './documents-routing.module';
import { AddNewDocumentTypeModalComponent } from './add-new-document-type-modal/add-new-document-type-modal.component';
import { DocumentTypesComponent } from './document-types/document-types.component';
import { DocTypesButtonsRendererComponent } from './renderers/doc-types-buttons-renderer';

@NgModule({
    declarations: [
        DocumentsComponent,
        DocumentsSearchComponent,
        AddNewDocumentTypeModalComponent,
        DocumentTypesComponent,
        DocTypesButtonsRendererComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        ModalModule.forRoot(),
        AgGridModule,
        StoreModule.forFeature('document_types_feature', DocumentTypesReducer),
        EffectsModule.forFeature([
            DocumentsEffects,
        ]),
        DocumentsRoutingModule
    ]
})
export class DocumentsModule { }
