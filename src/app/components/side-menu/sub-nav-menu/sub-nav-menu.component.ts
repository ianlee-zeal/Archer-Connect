/* eslint-disable import/no-unresolved */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

import { SideNavMenuService } from '@app/services/navigation/side-nav-menu.service';
import * as recentViewsActions from '@app/modules/shared/state/recent-views/actions';
import * as pinnedPagesActions from '@app/modules/shared/state/pinned-pages/actions';
import * as savedSearchActions from '@app/modules/shared/state/saved-search/actions';
import * as fromAuth from '@app/modules/auth/state/index';
import { EntityTypeEnum } from '@app/models/enums';
import { environment } from 'src/environments/environment';
import { filter, first } from 'rxjs/operators';
import { SideNavBase } from '../side-nav-base';
import { SavedSearchUrlService } from '@app/services';

@Component({
  selector: 'app-sub-nav-menu',
  templateUrl: './sub-nav-menu.component.html',
  styleUrls: ['./sub-nav-menu.component.scss'],
})
export class SubNavMenuComponent extends SideNavBase implements OnInit, OnDestroy {
  public readonly selectedOrganization$ = this.store.select<any>(fromAuth.authSelectors.selectedOrganization);
  public readonly user$ = this.store.select<any>(fromAuth.authSelectors.getUser);
  public currentDate = new Date();
  public readonly env = environment;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    store: Store<fromAuth.AppState>,
    navService: SideNavMenuService,
    savedSearchService: SavedSearchUrlService,
  ) {
    super(store, navService, savedSearchService);
  }

  ngOnInit() {
    this.addCurrentOrgListener();

    super.addMenuItemsChangedListener();
    super.addMainMenuInjectListener();
    super.addRecentViewsListener();
    super.addPinnedPagesListener();
    super.addSavedSearchListener();
  }

  public get visible() {
    return (<SideNavMenuService> this.navService).visible;
  }

  public get isExpanded() {
    return (<SideNavMenuService> this.navService).isExpanded;
  }

  private addCurrentOrgListener() {
    this.store.dispatch(recentViewsActions.GetRecentViews());
    this.store.dispatch(pinnedPagesActions.GetPinnedPages());
    this.selectedOrganization$.pipe(
      filter(selectedOrganization => !!selectedOrganization),
      first(),
    ).subscribe(() => {
      this.store.dispatch(savedSearchActions.GetSavedSearchList({ entityType: EntityTypeEnum.Clients }));
    });
  }

  public toggleMenu() {
    (<SideNavMenuService> this.navService).isExpanded = !this.isExpanded;
  }

  ngOnDestroy(): void {
    super.onDestroy();
  }
}
