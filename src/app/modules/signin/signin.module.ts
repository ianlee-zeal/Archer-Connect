import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignInCallbackComponent } from './signin-callback/signin-callback.component';
import { SignInRoutingModule } from './signin-routing.module';

@NgModule({
  declarations: [
    SignInCallbackComponent,
  ],
  exports: [],
  imports: [
    CommonModule,
    SignInRoutingModule,
  ],
})
export class SignInModule { }
