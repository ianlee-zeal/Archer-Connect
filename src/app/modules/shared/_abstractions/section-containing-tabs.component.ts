/* eslint-disable no-param-reassign */
import { OnDestroy, OnInit, Directive } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { EntityTypeEnum } from '@app/models/enums';
import { TabItem } from '@app/models';
import { TabInfoState } from '@app/modules/shared/state/tab-info/state';
import { tabInfoSelectors } from '@app/modules/shared/state/tab-info/selectors';
import { IDictionary } from '@app/models/utils';
import { CommonHelper } from '@app/helpers';

@Directive()
export abstract class SectionContainingTabsComponent implements OnInit, OnDestroy {
  protected readonly ngUnsubscribe$ = new Subject<void>();

  private readonly tabsCount$ = this.tabInfoStore.select(tabInfoSelectors.tabsCount);
  private tabsCount: IDictionary<number, number>;

  abstract tabs: TabItem[];
  abstract readonly entityType: EntityTypeEnum;

  protected abstract tabTitles: { [key: number]: string };

  constructor(private readonly tabInfoStore: Store<TabInfoState>) {}

  public ngOnInit(): void {
    this.tabsCount$
      .pipe(
        filter(tabsCount => !!tabsCount),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(tabsCount => {
        this.tabsCount = tabsCount[this.entityType];
        if (this.tabsCount && this.tabs?.length) {
          this.tabs.forEach(tab => {
            if (!CommonHelper.isNullOrUndefined(tab.id)) {
              tab.title = `${this.tabTitles[tab.id]}${this.getCount(tab.id)}`;
            }
          });
        }
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private getCount(entityType: EntityTypeEnum) {
    return this.tabsCount && this.tabsCount.containsKey(entityType) ? ` (${this.tabsCount.getValue(entityType)})` : '';
  }
}
