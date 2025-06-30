import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { reducer as authReducer } from './state/auth.reducer';
import { UserEffects } from './state/auth.effects';
import { AuthModuleFeatures } from './state';

@NgModule({
  imports: [
    CommonModule,
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    StoreModule.forFeature(AuthModuleFeatures.authFeature, authReducer),
    EffectsModule.forFeature([UserEffects]),
  ]
})
export class AuthorizationModule { }
