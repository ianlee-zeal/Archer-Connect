import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QsfSweepReducer } from './state/reducer';
import { QsfSweepEffects } from './state/effects';
import { SharedModule } from '../shared/shared.module';
import { RunQsfSweepModalComponent } from './run-qsf-sweep-modal/run-qsf-sweep-modal.component';
import { QsfSweepBatchListComponent } from './qsf-sweep-batch-list/qsf-sweep-batch-list.component';
import { QsfSweepRoutingModule } from './qsf-sweep-routing.module';
import { QsfSweepBatchActionsRendererComponent } from './qsf-sweep-batch-list/qsf-sweep-batch-actions-renderer/qsf-sweep-batch-actions-renderer.component';
import { QsfSweepResultListComponent } from './qsf-sweep-result-list/qsf-sweep-result-list.component';
import { QsfSweepChannelComponent } from './qsf-sweep-channel/qsf-sweep-channel.component';
import { QsfSweepCommitChangesModalComponent } from './qsf-sweep-commit-changes-modal/qsf-sweep-commit-changes-modal.component.ts';

@NgModule({
  declarations: [
    RunQsfSweepModalComponent,
    QsfSweepBatchListComponent,
    QsfSweepBatchActionsRendererComponent,
    QsfSweepResultListComponent,
    QsfSweepChannelComponent,
    QsfSweepCommitChangesModalComponent,
  ],
  exports: [
    RunQsfSweepModalComponent,
    QsfSweepChannelComponent,
    QsfSweepCommitChangesModalComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    SharedModule,
    ModalModule.forRoot(),
    AgGridModule,
    StoreModule.forFeature('qsf_sweep_feature', QsfSweepReducer),
    EffectsModule.forFeature([
      QsfSweepEffects,
    ]),
    QsfSweepRoutingModule,
  ],
})

export class QsfSweepModule { }
