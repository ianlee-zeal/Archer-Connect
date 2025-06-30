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
import { AuditorReducer } from './state/reducer';
import { AuditBatchesEffects } from './audit-batches/state/effects';
import { AuditBatchModalEffects } from './audit-batches/audit-batch-modal/state/effects';
import { AuditDetailsEffects } from './audit-batches/audit-details/state/effects';

import { AuditBatchesComponent } from './audit-batches/audit-batches.component';
import { AuditBatchesActionsRendererComponent } from './audit-batches/audit-batches-actions-renderer/audit-batches-actions-renderer.component';
import { AuditorRoutingModule } from './auditor-routing.module';
import { AuditorComponent } from './auditor.component';
import { AuditBatchModalComponent } from './audit-batches/audit-batch-modal/audit-batch-modal.component';

import { AuditBatchTemplateStepComponent } from './audit-batches/audit-batch-modal/steps/audit-batch-template/audit-batch-template.component';
import { AuditBatchSettingsStepComponent } from './audit-batches/audit-batch-modal/steps/audit-batch-settings/audit-batch-settings.component';
import { AuditBatchUploadStepComponent } from './audit-batches/audit-batch-modal/steps/audit-batch-upload/audit-batch-upload.component';
import { AuditBatchReviewStepComponent } from './audit-batches/audit-batch-modal/steps/audit-batch-review/audit-batch-review.component';
import { AuditBatchResultsStepComponent } from './audit-batches/audit-batch-modal/steps/audit-batch-results/audit-batch-results.component';

import { UploadAuditDataGridComponent } from './audit-batches/audit-batch-modal/steps/upload-audit-data-grid/upload-audit-data-grid.component';
import { UploadAuditDataAllRecordsListComponent } from './audit-batches/audit-batch-modal/steps/grids/all-records-list/upload-audit-data-all-records-list.component';
import { UploadAuditDataErrorsListComponent } from './audit-batches/audit-batch-modal/steps/grids/errors-list/upload-audit-data-errors-list.component';
import { UploadAuditDataWarningsListComponent } from './audit-batches/audit-batch-modal/steps/grids/warnings-list/upload-audit-data-warnings-list.component';

import { AuditBatchDetailsSectionComponent } from './sections/audit-batch-details-section.component';
import { AuditDetailsHeaderComponent } from './audit-batches/audit-details/audit-details-header/audit-details-header.component';
import { AuditDetailsComponent } from './audit-batches/audit-details/audit-details.component';
import { AuditClaimsListComponent } from './audit-batches/audit-details/audit-claims/audit-claims-list.component';
import { AuditClaimsActionsRendererComponent } from './audit-batches/audit-details/audit-claims/audit-claims-actions-renderer/audit-claims-actions-renderer.component';

@NgModule({
    declarations: [
        AuditorComponent,
        AuditBatchesComponent,
        AuditBatchesActionsRendererComponent,
        AuditBatchModalComponent,
        AuditBatchTemplateStepComponent,
        AuditBatchSettingsStepComponent,
        AuditBatchUploadStepComponent,
        AuditBatchReviewStepComponent,
        AuditBatchResultsStepComponent,
        UploadAuditDataGridComponent,
        UploadAuditDataAllRecordsListComponent,
        UploadAuditDataErrorsListComponent,
        UploadAuditDataWarningsListComponent,
        AuditBatchDetailsSectionComponent,
        AuditDetailsHeaderComponent,
        AuditDetailsComponent,
        AuditClaimsListComponent,
        AuditClaimsActionsRendererComponent,
    ],
    providers: [provideNgxMask()],
    exports: [],
    imports: [
        CommonModule,
        ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        QuillModule,
        SharedModule,
        AuditorRoutingModule,
        ModalModule.forRoot(),
        AgGridModule,
        StoreModule.forFeature('auditor_feature', AuditorReducer),
        EffectsModule.forFeature([
            AuditBatchesEffects, AuditBatchModalEffects, AuditDetailsEffects,
        ]),
        NgxMaskDirective, NgxMaskPipe,
    ]
})
export class AuditorModule {
}
