import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '@app/modules/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { reducer } from './state/reducer';

import { DwDeficienciesCriticalListComponent } from './dw-deficiency-summary/critical-deficiencies-list/deficiencies-critical-list.component';
import { DwDeficiencySummaryComponent } from './dw-deficiency-summary/dw-deficiency-summary.component';
import { DwDeficienciesWarningListComponent } from './dw-deficiency-summary/warning-deficiencies-list/deficiencies-warning-list.component';
import { DisbursementWorksheetModalEffects } from './state/effects';
import { DisbursementWorksheetModalComponent } from './disbursement-worksheet-modal.component';

@NgModule({
  declarations: [
    DwDeficiencySummaryComponent,
    DwDeficienciesWarningListComponent,
    DwDeficienciesCriticalListComponent,
    DisbursementWorksheetModalComponent,
  ],
  exports: [
    DisbursementWorksheetModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    StoreModule.forFeature('disbursement_worksheet_modal', reducer),
    EffectsModule.forFeature([
      DisbursementWorksheetModalEffects,
    ]),
  ],
})
export class DisbursementWorksheetModalModule { }
