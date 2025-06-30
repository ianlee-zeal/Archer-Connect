import { Component, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { QuickSearchItem } from '@app/models';
import { StringHelper } from '@app/helpers';
import * as fromRoot from '@app/state';
import * as rootActions from '@app/state/root.actions';

@Component({
  selector: 'quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss'],
})
export class QuickSearchComponent implements OnInit, OnDestroy {
  public quickSearchResults$ = this.store.select(fromRoot.quickSearchResults);
  public searchTextChanged$: Subject<string> = new Subject<string>();
  public searchText: string = '';
  public foundItems: QuickSearchItem[];

  private ngUnsubscribe$ = new Subject<void>();
  constructor(
    private store: Store<fromRoot.AppState>,
    private router: Router,
    private wrapperEl: ElementRef,
  ) {}

  ///

  public ngOnInit() {
    this.quickSearchResults$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((items: QuickSearchItem[]) => {
        this.foundItems = items;
      });

    this.searchTextChanged$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
      )
      .subscribe(searchText => {
        if (!searchText) {
          this.resetSearch();
          return;
        }
        this.searchText = searchText;
        this.onSearch(searchText);
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  ///

  public onSearch(query: string) {
    this.store.dispatch(rootActions.QuickSearch({ query, page: 1, perPage: 5 }));
  }

  public onEnter() {
    const { searchText } = this;
    if (!searchText) return;
    this.resetSearch();
    this.router.navigate(['/claimants'], {
      queryParams: QuickSearchComponent.getQueryParamsByQueryString(searchText.trim())
    });
  }

  public onBlur($event) {
    if (!this.wrapperEl.nativeElement.contains($event.relatedTarget)) {
      this.resetSearch();
    } else {
      setTimeout(this.resetSearch, 300);
    }
  }

  private resetSearch = () => {
    this.searchText = '';
    this.searchTextChanged$.next('');
    this.store.dispatch(rootActions.QuickSearchClear());
  }

  static getQueryParamsByQueryString(searchText: string): Record<string, string> {
    switch (true) {
      case StringHelper.isIntegerString(searchText):
        return {
          "filters.id": searchText
        }

      case searchText.includes(' '): {
        const [firstPart, secondPart] = searchText.split(/\s+/);
        return {
          "filters.firstName*": firstPart,
          "filters.lastName*": secondPart,
        }
      }

      default:
        return {
          "filters.lastName*": searchText
        };
    }
  }
}
