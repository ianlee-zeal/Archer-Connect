import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { QuillModule } from 'ngx-quill';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ProbatesRoutingModule } from './probates-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ProbatesListComponent } from './probates-list/probates-list.component';
import { ProbatesEffects } from './state/effects';
import { ProbatesReducer } from './state/reducer';
import { GenerateFirmUpdateModalComponent } from './probates-list/generate-firm-update-modal/generate-firm-update-modal.component';
import { ExportPendingPacketRequestsModalComponent } from './probates-list/export-pending-packet-requests-modal/export-pending-packet-requests-modal.component';

@NgModule({
  declarations: [
    ProbatesListComponent,
    GenerateFirmUpdateModalComponent,
    ExportPendingPacketRequestsModalComponent,
  ],
  imports: [
    CommonModule,
    ProbatesRoutingModule,
    AgGridModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    SharedModule,
    StoreModule.forFeature('probates_feature', ProbatesReducer),
    EffectsModule.forFeature([ProbatesEffects]),
    ModalModule.forRoot(),
    QuillModule,
  ],
})
export class ProbatesModule { }
