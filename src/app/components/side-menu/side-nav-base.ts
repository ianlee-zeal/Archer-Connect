import { Subject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';

import { EntityTypeEnum, NavMenuGroup } from '@app/models/enums';
import { NavItem, RecentView, PinnedPage } from '@app/models';
import { SavedSearch } from '@app/models/saved-search';
import { BaseNavService } from '@app/services/navigation/base-nav.service';
import { IconHelper } from '@app/helpers/icon-helper';
import { EntityTypeReadablePipe } from '@app/modules/shared/_pipes';
import { recentViewsSelector } from '@app/modules/shared/state/recent-views/selectors';
import { pinnedPagesSelector } from '@app/modules/shared/state/pinned-pages/selectors';
import { savedSearchSelectors } from '@app/modules/shared/state/saved-search/selectors';
import { GridId } from '@app/models/enums/grid-id.enum';

import * as recentViewsActions from '@app/modules/shared/state/recent-views/actions';
import * as pinnedPagesActions from '@app/modules/shared/state/pinned-pages/actions';
import * as savedSearchActions from '@app/modules/shared/state/saved-search/actions';
import * as commonActions from '@app/modules/shared/state/common.actions';
import * as fromRoot from '@app/state';
import * as fromRootActions from '@app/state/root.actions';
import { SavedSearchUrlService } from '@app/services';

/**
 * Common behavior for Hamburger and LeftSide menu
 *
 * @export
 * @abstract
 * @class SideNavBase
 */
export abstract class SideNavBase {
  protected recentViews$: Observable<RecentView[]>;
  protected pinnedPagesSelector$: Observable<PinnedPage[]>;
  protected savedSearch$: Observable<SavedSearch[]>;
  protected ngUnsubscribe$ = new Subject<void>();

  private entityTypeReadablePipe: EntityTypeReadablePipe = new EntityTypeReadablePipe();
  protected store: Store<fromRoot.AppState>;
  protected navService: BaseNavService;
  protected savedSearchService: SavedSearchUrlService;
  public items: NavItem[];
  public expandPinnedPages: boolean = false;

  constructor(
    store: Store<fromRoot.AppState>,
    navService: BaseNavService,
    savedSearchService: SavedSearchUrlService,
  ) {
    this.store = store;
    this.navService = navService;
    this.items = navService.items;
    this.savedSearchService = savedSearchService;

    this.recentViews$ = store.select<any>(recentViewsSelector.recentViews);
    this.pinnedPagesSelector$ = store.select<any>(pinnedPagesSelector.pinnedPages);
    this.savedSearch$ = store.select(savedSearchSelectors.savedSearchList);
  }

  protected addMenuItemsChangedListener(): void {
    this.navService.itemsChanged
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(items => { this.items = [...items]; });
  }

  protected addMainMenuInjectListener(): void {
    this.navService.mainMenuInjected
      .pipe(
        filter(isInjected => isInjected),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(() => {
        if (this.navService.find(NavMenuGroup.RecentViews)) {
          this.store.dispatch(recentViewsActions.GetRecentViews());
        }

        if (this.navService.find(NavMenuGroup.PinnedPages)) {
          this.store.dispatch(pinnedPagesActions.GetPinnedPages());
        }

        if (this.navService.find(NavMenuGroup.SavedSearch)) {
          this.store.dispatch(savedSearchActions.GetSavedSearchList({ entityType: EntityTypeEnum.Clients }));
        }
      });
  }

  protected addRecentViewsListener(): void {
    this.recentViews$
      .pipe(
        filter(recent => !!recent),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(items => {
        const recentViewsMenu = this.navService.find(NavMenuGroup.RecentViews);

        this.addMenu(recentViewsMenu && recentViewsMenu.id, items, (item: RecentView) => this.navigateTo(item));
      });
  }

  protected addPinnedPagesListener(): void {
    this.pinnedPagesSelector$
      .pipe(
        filter(pinned => !!pinned),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(items => {
        const pinnedPagesMenu = this.navService.find(NavMenuGroup.PinnedPages);

        this.addPinnedPageMenu(pinnedPagesMenu && pinnedPagesMenu.id, items, (item: PinnedPage) => this.navigateTo(item));
      });
  }

  protected addSavedSearchListener(): void {
    this.savedSearch$
      .pipe(
        filter(savedSearch => !!savedSearch),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(items => {
        const savedSearchMenu = this.navService.find(NavMenuGroup.SavedSearch);
        this.addSavedSearchMenu(savedSearchMenu && savedSearchMenu.id, items);
      });
  }

  private addMenu(groupId: string, items: RecentView[] | PinnedPage[], action: Function = null) {
    if (groupId) {
      this.navService.removeChildren(groupId);

      for (const item of items) {
        const menuItem = NavItem.create(<NavItem>{
          name: item.name || item.url,
          icon: IconHelper.getIconByEntityType(item.entityTypeId),
          iconTooltip: this.entityTypeReadablePipe.transform(item.entityTypeId),
          route: item.url,
          action: () => { if (action) { action(item); } },
        });

        this.navService.add(menuItem, groupId);
      }
    }
  }

  private addSavedSearchMenu(groupId: string, items: SavedSearch[]) {
    if (groupId) {
      this.navService.removeChildren(groupId);
      if (items.length > 0) {
        this.navService.add(NavItem.create(<NavItem>{
          name: 'View All',
          icon: 'assets/images/ic_basic_search.svg',
          route: '/saved-searches',
          autoScrollEnabled: true,
        }), groupId);

        for (const item of items) {
          const menuItem = NavItem.create(<NavItem>{
            name: item.name,
            icon: IconHelper.getIconByEntityType(item.entityType),
            route: this.savedSearchService.getSavedSearchUrl(item.entityType, item.id, item.projectId),
            autoScrollEnabled: true,
            action: () => this.store.dispatch(fromRootActions.ClearGridLocalData({ gridId: GridId.Claimants })),
          });
          this.navService.add(menuItem, groupId);
        }
      }
    }
  }

  private addPinnedPageMenu(groupId: string, items: PinnedPage[], action: Function = null) {
    if (groupId) {
      this.navService.removeChildren(groupId);
      if (items.length) {
        const toggleList = () => {
          if (!this.expandPinnedPages) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            listRenderer(items.length, 'Show 5 most recent');
            this.expandPinnedPages = true;
          } else {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            listRenderer();
            this.expandPinnedPages = false;
          }
        };

        const listRenderer = (itemsCount = 5, buttonName = 'View All') => {
          this.navService.removeChildren(groupId);

          for (const item of items.slice(0, itemsCount)) {
            const menuItem = NavItem.create(<NavItem>{
              name: item.name || item.url,
              icon: IconHelper.getIconByEntityType(item.entityTypeId),
              iconTooltip: this.entityTypeReadablePipe.transform(item.entityTypeId),
              route: item.url,
              action: () => {
                if (action) { action(item); }
                this.expandPinnedPages = false;
              },
            });

            this.navService.add(menuItem, groupId);
          }

          if (items.length > 5) {
            this.navService.add(NavItem.create(<NavItem>{
              name: buttonName,
              icon: 'assets/images/ic_basic_search.svg',
              isRedirectable: false,
              action: () => toggleList(),
            }), groupId);
          }
        };
        listRenderer();
      }
    }
  }

  private navigateTo(item: PinnedPage | RecentView) {
    this.store.dispatch(fromRootActions.NavigateToUrl({ url: item.url }));
    this.store.dispatch(commonActions.ResetActivePager());
  }

  protected onDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
