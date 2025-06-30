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
import { LienDeficienciesReducer } from './state/reducer';
import { LienDeficienciesGridEffects } from './lien-deficiencies-grid/state/effects';

import { LienDeficienciesGridComponent } from './lien-deficiencies-grid/lien-deficiencies-grid.component';
import { LienDeficienciesGridActionsRendererComponent } from './lien-deficiencies-grid/lien-deficiencies-grid-actions-renderer/lien-deficiencies-grid-actions-renderer.component';
import { LienDeficienciesRoutingModule } from './lien-deficiencies-routing.module';
import { LienDeficienciesComponent } from './lien-deficiencies.component';
import { LienDeficienciesManagementGridComponent } from './lien-deficiencies-management-grid/lien-deficiencies-management-grid.component';
import { LienDeficienciesManagementGridEffects } from './lien-deficiencies-management-grid/state/effects';
import { LienDeficienciesManagementGridActionsRendererComponent } from './lien-deficiencies-management-grid/lien-deficiencies-management-grid-actions-renderer/lien-deficiencies-management-grid-actions-renderer.component';

@NgModule({
    declarations: [
        LienDeficienciesComponent,
        LienDeficienciesGridComponent,
        LienDeficienciesGridActionsRendererComponent,
        LienDeficienciesManagementGridActionsRendererComponent,
        LienDeficienciesManagementGridComponent,
    ],
    providers: [provideNgxMask()],
    exports: [],
    imports: [
        CommonModule,
        ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        QuillModule,
        SharedModule,
        LienDeficienciesRoutingModule,
        ModalModule.forRoot(),
        AgGridModule,
        StoreModule.forFeature('lien_deficiencies_feature', LienDeficienciesReducer),
        EffectsModule.forFeature([
            LienDeficienciesGridEffects,
            LienDeficienciesManagementGridEffects,
        ]),
        NgxMaskDirective, NgxMaskPipe,
    ]
})
export class LienDeficienciesModule {
}
