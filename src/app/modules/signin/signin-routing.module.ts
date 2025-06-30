import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInCallbackComponent } from './signin-callback/signin-callback.component';

const routes: Routes = [
  {
    path: '',
    component: SignInCallbackComponent,
    data: { ignoreBackNav: true },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignInRoutingModule { }
