import { NgModule } from '@angular/core';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AgGridModule } from 'ag-grid-angular';
import { SharedModule } from '@app/modules/shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { reducer } from './state/reducer';
import { BillingRuleTemplatesListComponent } from './billing-rule-templates-list/billing-rule-templates-list.component';
import { EditBillingRuleTemplateModalComponent } from './edit-billing-rule-template/edit-billing-rule-template-modal.component';
import { BrtActionPanelCellRendererComponent } from './renderers/action-panel-cell-renderer/action-panel-cell-renderer.component';
import { BillingRuleTemplateEffects } from './state/effects';
import { BillingRuleTemplatesRoutingModule } from './billing-rule-templates-routing.module';
import { featureName } from './state/actions';
import { BillingRuleTemplateDetailsComponent } from './billing-rule-template-details/billing-rule-template-details.component';

@NgModule({
  declarations: [
    BillingRuleTemplatesListComponent,
    EditBillingRuleTemplateModalComponent,
    BrtActionPanelCellRendererComponent,
    BillingRuleTemplateDetailsComponent,
  ],
  providers: [provideNgxMask()],
  exports: [],
  imports: [
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    CommonModule,
    SharedModule,
    BillingRuleTemplatesRoutingModule,
    ModalModule.forRoot(),
    AgGridModule,
    StoreModule.forFeature(featureName, reducer),
    EffectsModule.forFeature([BillingRuleTemplateEffects]),
    NgxMaskDirective, NgxMaskPipe,
  ],
})
export class BillingRuleTemplatesModule { }
