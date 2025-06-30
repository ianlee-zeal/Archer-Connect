import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, Event, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';

import * as commonActions from '@shared/state/common.actions';
import * as fromAuth from '../../modules/auth/state';
import * as authActions from '../../modules/auth/state/auth.actions';
import * as impersonateActions from '../../modules/shared/state/org-impersonate/actions';
import { OrgSwitchDialogComponent } from '@shared/org-switch-dialog/org-switch-dialog.component';
import { OrgImpersonateDialogComponent } from '@shared/org-impersonate-dialog/org-impersonate-dialog.component';
import {
  SideMenuPageTrackerService,
  SideNavBarService,
  ModalService
} from '@app/services/';
import { environment } from 'src/environments/environment';
import { UserInfo } from '@app/models';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss'],
})
export class TopNavComponent implements OnInit, OnDestroy {
  public user$ = this.store.select<any>(fromAuth.authSelectors.getUser);
  public selectedOrganization$ = this.store.select<any>(fromAuth.authSelectors.selectedOrganization);
  public toggled$ = this.sideNavBarService.toggleChanged;

  public current_path;
  public currentPageName = null;
  public bsModalRef: BsModalRef;
  public canSwitchToDefaultOrg: boolean;
  public isUatBannerDisplayed: boolean = environment.isUat;
  public user: UserInfo;
  private token = null;
  private readonly url = environment.help_url;

  public pageName = new Subject<string>();
  pageName$ = this.pageName.asObservable();

  private ngUnsubscribe$ = new Subject<void>();

  get helpUrl(): string {
    return `${this.url}/Init?t=${this.token}`;
  }

  get supportUrl(): string {
    return 'https://www.archerportalsupport.help/'
    }

  get isImpersonating(): boolean {
    return this.user && this.user.isImpersonating;
  }

  get logoUrl(): string {
    return this.user.selectedOrganization.isMaster ? 'assets/images/logo_r_blue.png' : 'assets/images/logo_arrow.png';
  }

  /**
   * Event fired when dropdown menu should be toggled
   *
   * @memberof TopNavComponent
   */
  @Output()
  readonly toggleMenu = new EventEmitter();

  constructor(
    private store: Store<fromAuth.AppState>,
    private router: Router,
    private sideMenuPageTrackerService: SideMenuPageTrackerService,
    private sideNavBarService: SideNavBarService,
    private modalService: ModalService,
    private oidcSecurityService: OidcSecurityService,
  ) { }

  ngOnInit() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.current_path = this.getPath(event.url);
        this.pageChange(this.current_path);
      }
    });

    this.oidcSecurityService.getAccessToken().subscribe((token: string) => {
      this.token = token;
    });

    this.sideMenuPageTrackerService.pageName$.subscribe(page => { this.currentPageName = page; });

    this.user$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter(user => !!user),
      )
      .subscribe(user => {
        this.canSwitchToDefaultOrg = user.defaultOrganization
          && user.defaultOrganization.id !== user.selectedOrganization.id
          && !!user.organizations.find(org => org.id === user.defaultOrganization.id);

        this.user = user;
      });
  }

  pageChange(pageName: string) {
    this.pageName.next(pageName);
  }

  // eslint-disable-next-line class-methods-use-this
  getPath(url) {
    // eslint-disable-next-line no-restricted-globals
    const parts = url.split('/').slice(1).map(p => ((isNaN(p)) ? p : ':id'));
    const path = `/${parts.join('/')}`;
    return path;
  }

  public gotoDefSearch() {
    this.store.dispatch(commonActions.GotoDefaultView({ userId: this.user.id }));
  }

  public switchToDefaultOrg(id: number) {
    this.store.dispatch(authActions.SelectOrganization({ id }));
  }

  public showSwitchOrgDialog(orgId: number) {
    const initialState = { activeOrgId: orgId };
    this.bsModalRef = this.modalService.show(OrgSwitchDialogComponent, {
      initialState,
      class: 'representative-modal'
    });
  }

  public showImpersonateOrgDialog() {
    this.bsModalRef = this.modalService.show(OrgImpersonateDialogComponent, {
      class: 'representative-modal'
    });
  }

  public depersonateOrg() {
    this.store.dispatch(impersonateActions.DepersonateOrgRequest());
  }

  public toggleSideNavBar() {
    this.sideNavBarService.toggle();
  }

  public logout(): void {
    this.store.dispatch(authActions.AuthLogout());
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
