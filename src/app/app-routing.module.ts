import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutFullComponent } from './components/layout-full/layout-full.component';
import { LayoutMainComponent } from './components/layout-main/layout-main.component';

import { AuthGuard } from './modules/auth/auth-guard.service';
import { TabPlaceholderUnderConstructionComponent } from './modules/shared/tab-placeholder/tab-placeholder-under-construction/tab-placeholder-under-construction.component';

import { TermsAndConditionsComponent } from './modules/shared/terms-and-conditions/terms-and-conditions.component';
import { PrivacyComponent } from './modules/shared/privacy/privacy.component';
import { SignoutCallbackComponent } from './components/signout-callback/signout-callback.component';
import { NoAccessComponent } from './modules/shared/no-access/no-access.component';
import { SessionGuard } from './modules/auth/session.guard';
import { LayoutRawHtmlComponent } from './components/layout-raw/layout-raw.component';
import { NotFoundComponent } from './modules/shared/not-found/not-found.component';

export const ROUTE_SIGN_IN = 'signin';
export const ROUTE_HOME = '/home';

const routes: Routes = [
  { path: '', redirectTo: '/claimants', pathMatch: 'full' },
  {
    path: '',
    component: LayoutRawHtmlComponent,
    canActivate: [SessionGuard],
    children: [
      { path: ROUTE_SIGN_IN, loadChildren: () => import('./modules/signin/signin.module').then(m => m.SignInModule) },
    ],
  },
  {
    path: '',
    component: LayoutFullComponent,
    canActivate: [SessionGuard],
    children: [
      { path: 'login', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthorizationModule) },
      { path: 'signout', component: SignoutCallbackComponent },
      { path: 'terms', component: TermsAndConditionsComponent },
      { path: 'privacy', component: PrivacyComponent },
    ],
  },
  {
    path: '',
    component: LayoutMainComponent,
    canActivate: [AuthGuard, SessionGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'home', loadChildren: () => import('@app/modules/firm-landing-page/firm-landing-page.module').then(m => m.FirmLandingPageModule) },
      { path: 'defense-dashboard', loadChildren: () => import('./modules/defense-dashboard/defense-dashboard.module').then(m => m.DefenseDashboardModule) },
      { path: 'tort-dashboard', loadChildren: () => import('./modules/tort-dashboard/tort-dashboard.module').then(m => m.TortDashboardModule) },
      { path: 'dashboard', loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'saved-searches', loadChildren: () => import('./modules/saved-searches/saved-searches.module').then(m => m.SavedSearchesModule) },
      { path: 'admin', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule) },
      { path: 'cases', redirectTo: 'projects', pathMatch: 'full' },
      { path: 'projects', loadChildren: () => import('./modules/projects/projects.module').then(m => m.ProjectsModule) },
      { path: 'claimants', loadChildren: () => import('./modules/claimants/claimants.module').then(m => m.ClaimantsModule) },
      { path: 'settlements', loadChildren: () => import('./modules/settlements/settlements.module').then(m => m.SettlementsModule) },
      { path: 'disbursements', loadChildren: () => import('./modules/disbursements/disbursements.module').then(m => m.DisbursementsModule) },
      { path: 'user-profile', loadChildren: () => import('./modules/user-profile/user-profile.module').then(m => m.UserProfileModule) },
      { path: 'templates', loadChildren: () => import('./modules/document-templates/document-templates.module').then(m => m.DocumentTemplatesModule) },
      { path: 'auditor', loadChildren: () => import('./modules/auditor/auditor.module').then(m => m.AuditorModule) },
      { path: 'lien-finalization', loadChildren: () => import('./modules/lien-finalization/lien-finalization.module').then(m => m.AuditorModule) },
      { path: 'lien-deficiencies', loadChildren: () => import('./modules/lien-deficiencies/lien-deficiencies.module').then(m => m.LienDeficienciesModule) },
      { path: 'probates', loadChildren: () => import('./modules/probates/probates.module').then(m => m.ProbatesModule) },
      { path: 'tasks', loadChildren: () => import('./modules/task/task.module').then(m => m.TaskModule) },
      { path: 'invoice-items', loadChildren: () => import('./modules/accounting/accounting.module').then(m => m.AccountingModule) },
      { path: 'payment-queue', loadChildren: () => import('./modules/payment-queue/payment-queue.module').then(m => m.PaymentQueueModule) },
      { path: 'nowhere', component: TabPlaceholderUnderConstructionComponent },
      { path: 'no-access', component: NoAccessComponent, data: { ignoreBackNav: true } },
      { path: 'not-found', component: NotFoundComponent, data: { ignoreBackNav: true } },
      { path: 'document-batches', loadChildren: () => import('./modules/document-batch/document-batch.module').then(m => m.DocumentBatchModule)},
      { path: 'andi-messaging', loadChildren: () => import('./modules/communication-hub/communication-hub.module').then(m => m.CommunicationHubModule) },
    ],
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  // imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
