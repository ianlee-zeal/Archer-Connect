import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import * as callWidgetSelectors from '@app/modules/call-center/call-widget/state/selectors';
import { CallCenterState } from '@app/modules/call-center/state/reducer';
import { SideNavBarService } from '@app/services/navigation/side-nav-bar.service';
import { Idle } from '@ng-idle/core';
import { SessionService } from '@app/services';
import { loadingInProgress } from '@app/state';
import { isBannerClosed } from '@app/state';
import { RootState } from '../../state/root.state';
import * as rootActions from '../../state/root.actions';
import { CurrentUserOrganizationService } from '@app/services/current-user-organization.service';

/**
 * Main layout component
 *
 * @export
 * @class LayoutMainComponent
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-layout-main',
  templateUrl: './layout-main.component.html',
  styleUrls: ['./layout-main.component.scss'],
})
export class LayoutMainComponent implements OnDestroy, OnInit {
  private readonly menuToggledSub: Subscription;
  private idleInterruptSub: Subscription;

  public readonly loadingInProgress$ = this.rootStore.select(loadingInProgress);
  public readonly isBannerClosed$ = this.rootStore.select(isBannerClosed);
  protected readonly isCurrentOrgMaster: boolean = this.currentUserOrgService.isMaster;

  @HostListener('wheel', ['$event'])
  handleWheelEvent(event) {
    if (this.sideNavBarService.opened) {
      event.preventDefault();
    }
  }

  /**
   * Gets or sets the flag indicating whether side menu is toggled or not
   *
   * @memberof LayoutMainComponent
   */
  menuIsToggled = false;

  /**
   * Gets the observable of call information
   *
   * @memberof LayoutMainComponent
   */
  readonly callInfo$ = this.store.select(callWidgetSelectors.callInfo);

  /**
   * Creates an instance of LayoutMainComponent.
   * @param {Store<CallCenterState>} _store - current call center store
   * @param {SideNavBarService} _sideNavBarService - service for handling of side navigation bar
   * @param {Router} router - current router object
   * @memberof LayoutMainComponent
   */
  constructor(
    private readonly store: Store<CallCenterState>,
    private readonly rootStore: Store<RootState>,
    private readonly sideNavBarService: SideNavBarService,
    router: Router,
    private idle: Idle,
    private sessionService: SessionService,
    private readonly currentUserOrgService: CurrentUserOrganizationService,
  ) {
    this.menuToggledSub = router.events.pipe(
      filter(event => event instanceof NavigationEnd && this.menuIsToggled),
    ).subscribe(() => {
      this.menuIsToggled = false;
    });
  }

  ngOnInit(): void {
    this.idleInterruptSub = this.idle.onInterrupt
      .pipe(
        filter((e: any) => e && e.type !== 'storage'),
      )
      .subscribe(() => {
        this.sessionService.startNewSession();
      });
    this.rootStore.dispatch(rootActions.ResetLoading());
  }

  /** @inheritdoc */
  ngOnDestroy(): void {
    if (this.menuToggledSub) {
      this.menuToggledSub.unsubscribe();
    }

    if (this.idleInterruptSub) {
      this.idleInterruptSub.unsubscribe();
    }
  }
}
