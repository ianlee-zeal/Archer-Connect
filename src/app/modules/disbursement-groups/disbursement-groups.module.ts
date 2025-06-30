import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AgGridModule } from 'ag-grid-angular';
import { DisbursementGroupsGridComponent } from './components/disbursement-groups-grid/disbursement-groups-grid.component';
import { DisbursementGroupsReducerReducer } from './state/reducer';
import { DisbursementGroupsEffects } from './state/effects';
import { SharedModule } from '../shared/shared.module';
import { DisbursementGroupButtonsRendererComponent } from './renderers/disbursement-group-buttons-renderer';

@NgModule({
  declarations: [DisbursementGroupsGridComponent, DisbursementGroupButtonsRendererComponent],
  imports: [
    CommonModule,

    SharedModule,

    AgGridModule,

    StoreModule.forFeature('disbursement-groups_feature', DisbursementGroupsReducerReducer),
    EffectsModule.forFeature([DisbursementGroupsEffects]),
  ],

  exports: [
    DisbursementGroupsGridComponent,
    DisbursementGroupButtonsRendererComponent,
  ],
})
export class DisbursementGroupsModule { }
