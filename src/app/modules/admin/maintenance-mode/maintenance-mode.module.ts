import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/modules/shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { MaintenanceModeRoutingModule } from './maintenance-mode-routing.module';
import { MaintenanceModePageComponent } from './maintenance-mode-page/maintenance-mode-page.component';
import { featureName } from './state/actions';
import { reducer } from './state/reducer';
import { MaintenanceEffects } from './state/effects';
import { EditBannerModalComponent } from './edit-banner-modal/edit-banner-modal.component';
import { QuillModule } from 'ngx-quill';

@NgModule({
  declarations: [
    MaintenanceModePageComponent,
    EditBannerModalComponent,
  ],
  providers: [provideNgxMask()],
  exports: [],
  imports: [
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    CommonModule,
    SharedModule,
    MaintenanceModeRoutingModule,
    ModalModule.forRoot(),
    AgGridModule,
    StoreModule.forFeature(featureName, reducer),
    EffectsModule.forFeature([MaintenanceEffects]),
    NgxMaskDirective,
    NgxMaskPipe,
    QuillModule
  ],
})
export class MaintenanceModeModule { }
