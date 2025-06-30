import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ModalModule } from 'ngx-bootstrap/modal';
import { QuillModule } from 'ngx-quill';

import { SharedModule } from '@shared/shared.module';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { LienFinalizationReducer } from './state/reducer';
import { LienFinalizationGridEffects } from './lien-finalization-grid/state/effects';
import { LienProcessingModalEffects } from './lien-finalization-grid/lien-processing-modal/state/effects';

import { LienFinalizationGridComponent } from './lien-finalization-grid/lien-finalization-grid.component';
import { LienFinalizationGridActionsRendererComponent } from './lien-finalization-grid/lien-finalization-grid-actions-renderer/lien-finalization-grid-actions-renderer.component';
import { LienFinalizationRoutingModule } from './lien-finalization-routing.module';
import { LienFinalizationComponent } from './lien-finalization.component';
import { LienProcessingModalComponent } from './lien-finalization-grid/lien-processing-modal/lien-processing-modal.component';
import { FinalizationDetailsGridComponent } from './finalization-details/finalization-details-grid/finalization-details-grid.component';
import { LienFinalizationDetailsSectionComponent } from './sections/lien-finalization-details-section.component';
import { FinalizationDetailsComponent } from './finalization-details/finalization-details.component';
import { FinalizationDetailsHeaderComponent } from './finalization-details/finalization-details-header/finalization-details-header.component';
import { FinalizationDetailsEffects } from './finalization-details/state/effects';
import { FinalizationDetailsActionsRendererComponent } from './finalization-details/finalization-details-grid/finalization-details-actions-renderer/finalization-details-actions-renderer.component';

@NgModule({
    declarations: [
        LienFinalizationComponent,
        LienFinalizationGridComponent,
        LienFinalizationGridActionsRendererComponent,
        LienProcessingModalComponent,
        FinalizationDetailsGridComponent,
        LienFinalizationDetailsSectionComponent,
        FinalizationDetailsComponent,
        FinalizationDetailsHeaderComponent,
        FinalizationDetailsActionsRendererComponent,
    ],
    providers: [provideNgxMask()],
    exports: [],
    imports: [
        CommonModule,
        ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        QuillModule,
        SharedModule,
        LienFinalizationRoutingModule,
        ModalModule.forRoot(),
        AgGridModule,
        StoreModule.forFeature('lien_finalization_feature', LienFinalizationReducer),
        EffectsModule.forFeature([
            LienFinalizationGridEffects, LienProcessingModalEffects, FinalizationDetailsEffects,
        ]),
        NgxMaskDirective, NgxMaskPipe,
    ]
})
export class AuditorModule {
}
