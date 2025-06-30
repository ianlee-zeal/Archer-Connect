import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { QuillModule } from 'ngx-quill';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AccountingRoutingModule } from './accounting-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AccountingEffects } from './state/effects';
import { AccountingReducer } from './state/reducer';
import { AccountingInvoiceItemsComponent } from './accounting-invoice-items/accounting-invoice-items.component';

@NgModule({
  declarations: [
    AccountingInvoiceItemsComponent,
  ],
  imports: [
    CommonModule,
    AccountingRoutingModule,
    AgGridModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    SharedModule,
    StoreModule.forFeature('accounting_feature', AccountingReducer),
    EffectsModule.forFeature([AccountingEffects]),
    ModalModule.forRoot(),
    QuillModule,
  ],
})
export class AccountingModule { }
