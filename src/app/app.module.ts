import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouteReuseStrategy } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ToastrModule } from 'ngx-toastr';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Quill from 'quill';
import { QuillModule } from 'ngx-quill';

import * as Sentry from '@sentry/angular-ivy';

import { AuthModule } from 'angular-auth-oidc-client';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive'; // this includes the core NgIdleModule but includes keepalive providers for easy wireup
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppRoutingReuseStrategy } from './app-routing-reuse.strategy';

import { reducers, metaReducers } from './state/app.reducers';
import { RootEffects } from './state/root.effects';

import { LayoutFullComponent } from './components/layout-full/layout-full.component';
import { LayoutMainComponent } from './components/layout-main/layout-main.component';
import { LayoutRawHtmlComponent } from './components/layout-raw/layout-raw.component';
import { QuickSearchComponent } from './components/quick-search/quick-search.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';

import { AuthorizationModule } from './modules/auth/auth.module';
import { SharedModule } from './modules/shared/shared.module';
import { HttpErrorsInterceptor } from './interceptors/http-errors.interceptor';
import { HttpLoadingInterceptor } from './interceptors/http-loading-interceptor';
import { CallCenterModule } from './modules/call-center/call-center.module';
import { QuillEditorHelper } from './helpers/quill-editor.helper';
import { CustomClipboard } from './quill/custom-clipboard';
import { HttpAuthorizationInterceptor } from './interceptors/http-authorization.interceptor';
import { SignoutCallbackComponent } from './components/signout-callback/signout-callback.component';
import { SideNavComponent } from './components/side-menu/side-nav/side-nav.component';
import { SideNavBarComponent } from './components/side-menu/side-nav-bar/side-nav-bar.component';
import { SubNavMenuComponent } from './components/side-menu/sub-nav-menu/sub-nav-menu.component';
import { IdleModalComponent } from './components/idle-modal/idle-modal.component';
import { TopNavDropdownMenuComponent } from './components/top-nav/top-nav-dropdown-menu/top-nav-dropdown-menu.component';
import { TopNavDropdownHelpComponent } from './components/top-nav/top-nav-dropdown-help/top-nav-dropdown-help.component';
import { BannerComponent } from './components/banner/banner.component';
import { ProjectsReducer } from './modules/projects/state/reducer';
import { ProbatesReducer } from './modules/probates/state/reducer';
import { ProjectsEffects } from './modules/projects/state/effects';
import { InjuryEventListReducer } from './modules/claimants/claimant-details/injury-events-tab/state/reducer';
import { reducer } from './modules/claimants/claimant-details/state/reducer';
import { mainReducer } from './modules/claimants/state/reducer';
import { ClaimantDetailsEffects } from './modules/claimants/claimant-details/state/effects';
import { ClaimantEffects } from './modules/claimants/state/effects';
import { InjuryEventsListEffects } from './modules/claimants/claimant-details/injury-events-tab/state/effects';
import { ClaimantDisbursementListEffects } from './modules/claimants/claimant-details/disbursements/claimant-disbursements/state/effects';
import { NavigationalEffects } from './state/navigate.effects';
import { GlobalErrorHandler } from './interceptors/global-error-handler';
import { documentBatchReducer } from './modules/document-batch/state/reducer';
import { DocumentBatchEffects } from './modules/document-batch/state/effects';
import { orgImpersonateReducer } from './modules/shared/state/org-impersonate/reducer';
import { OrgImpersonateEffects } from './modules/shared/state/org-impersonate/effects';
import { CommunicationHubReducer } from './modules/communication-hub/state/reducer';
import { CommunicationHubEffects } from './modules/communication-hub/state/effects';

@NgModule({
  declarations: [
    AppComponent,
    LayoutFullComponent,
    LayoutMainComponent,
    LayoutRawHtmlComponent,
    TopNavComponent,
    SignoutCallbackComponent,
    SideNavComponent,
    SideNavBarComponent,
    SubNavMenuComponent,
    IdleModalComponent,
    QuickSearchComponent,
    TopNavDropdownMenuComponent,
    TopNavDropdownHelpComponent,
    BannerComponent,
  ],
  imports: [
    AppRoutingModule,
    AuthorizationModule,
    SharedModule,
    BrowserModule,
    HttpClientModule,
    CallCenterModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
      },
    }),
    StoreDevtoolsModule.instrument({
      name: 'Archer Demo App DevTools',
      maxAge: 5,
      logOnly: environment.production,
    }),
    EffectsModule.forRoot([RootEffects, NavigationalEffects]),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    QuillModule.forRoot({
      format: 'html',
      modules: QuillEditorHelper.modules,
    }),
    AuthModule.forRoot({
      config: {
        authority: environment.sts_server,
        redirectUrl: `${window.location.origin}/signin`,
        clientId: 'archer-connect-app',
        scope: 'openid profile archer-connect-api offline_access',
        responseType: 'id_token token',
        postLogoutRedirectUri: `${window.location.origin}/signout`,
        triggerAuthorizationResultEvent: true,
        // startChecksession: true,
        // useRefreshToken: true,
        renewTimeBeforeTokenExpiresInSeconds: 60,
        disableIatOffsetValidation: true,
        ignoreNonceAfterRefresh: true,
        authWellknownEndpoints: {
          issuer: environment.sts_server,
          jwksUri: `${environment.sts_server}/.well-known/openid-configuration/jwks`,
          authorizationEndpoint: `${environment.sts_server}/connect/authorize`,
          tokenEndpoint: `${environment.sts_server}/connect/token`,
          userInfoEndpoint: `${environment.sts_server}/connect/userinfo`,
          endSessionEndpoint: `${environment.sts_server}/connect/endsession`,
          checkSessionIframe: `${environment.sts_server}/connect/checksession`,
          revocationEndpoint: `${environment.sts_server}/connect/revocation`,
          introspectionEndpoint: `${environment.sts_server}/connect/introspect`,
        },
      },
    }),
    NgIdleKeepaliveModule.forRoot(),
    StoreModule.forFeature('projects_feature', ProjectsReducer),
    StoreModule.forFeature('claimant_injury_events_feature', InjuryEventListReducer),
    StoreModule.forFeature('claimant_details_feature', reducer),
    StoreModule.forFeature('claimants_feature', mainReducer),
    StoreModule.forFeature('probates_feature', ProbatesReducer),
    StoreModule.forFeature('document_batch_feature', documentBatchReducer),
    StoreModule.forFeature('org_impersonate_feature', orgImpersonateReducer),
    StoreModule.forFeature('communication_hub_feature', CommunicationHubReducer),
    EffectsModule.forFeature([
      ProjectsEffects,
      ClaimantDetailsEffects,
      ClaimantEffects,
      InjuryEventsListEffects,
      ClaimantDisbursementListEffects,
      DocumentBatchEffects,
      OrgImpersonateEffects,
      CommunicationHubEffects,
    ]),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorsInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpLoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpAuthorizationInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: AppRoutingReuseStrategy },
    { provide: ErrorHandler, useValue: Sentry.createErrorHandler({ showDialog: false }) },
    { provide: Sentry.TraceService, deps: [Router], useValue: undefined },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {
        Quill.default.register('modules/clipboard', CustomClipboard as any, true);
      },
      deps: [Sentry.TraceService],
      multi: true,
    },
    {
      // Processes all UI errors
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
  ],
  bootstrap: [
    AppComponent,
  ],
})

export class AppModule {}
