import { Component, OnDestroy, OnInit, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { IdValue } from '@app/models';
import { SearchOptionsHelper, StringHelper } from '@app/helpers';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { FirmLandingPageState } from '../state/reducer';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { FilterModelOperation } from '@app/models/advanced-search/filter-model-operation.enum';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { EntityTypeEnum } from '@app/models/enums';
import * as rootActions from '@app/state/root.actions';
import * as fromRoot from '@app/state';
import * as fromProject from '@app/modules/projects/state/selectors';
import * as projectActions from '@app/modules/projects/state/actions';
import { IServerSideGetRowsParamsExtended } from '@shared/_interfaces/ag-grid/ss-get-rows-params';
import { QuickSearchOption } from '@shared/_abstractions/quick-search-option';

@Component({
  selector: 'app-landing-page-global-search',
  templateUrl: './landing-page-global-search.component.html',
  styleUrl: './landing-page-global-search.component.scss'
})
export class LandingPageGlobalSearchComponent implements OnInit, OnDestroy {

  @Input() public searchDropdownOptions: QuickSearchOption[] = [];

  public idValueCases$ = this.store.select(selectors.idValueCases);
  public quickSearchResults$ = this.rootStore.select(fromRoot.quickSearchResults);
  public projectClaimants$ = this.rootStore.select(fromProject.clients);
  public searchTextChanged$: Subject<string> = new Subject<string>();
  public searchText: string = '';
  public foundItems: IdValue[];

  private ngUnsubscribe$ = new Subject<void>();
  constructor(
    private store: Store<FirmLandingPageState>,
    private rootStore: Store<fromRoot.AppState>,
    private router: Router,
    private wrapperEl: ElementRef,
  ) {}

  public ngOnInit() {
    this.idValueCases$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((items: IdValue[]) => {
        if(this.activeDropdownOption.id == EntityTypeEnum.Projects)
          this.foundItems = items;
      });

    this.quickSearchResults$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((items: IdValue[]) => {
        if(this.activeDropdownOption.id == EntityTypeEnum.Clients)
          this.foundItems = items;
      });

    this.projectClaimants$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((items: IdValue[]) => {
        if(this.activeDropdownOption.id == EntityTypeEnum.ProjectClaimantSummary)
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

  public get inactiveDropdownOption(): QuickSearchOption {
    return this.searchDropdownOptions.find(option => !option.active);
  }

  public get activeDropdownOption(): QuickSearchOption {
    return this.searchDropdownOptions.find(option => option.active);
  }

  public changeSearchByEntityType(): void {
    this.searchDropdownOptions.forEach(option => {
      option.active = !option.active;
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onSearch(query: string) {

    if (this.activeDropdownOption.id == EntityTypeEnum.Projects) {
      var filter = new FilterModel();
      filter.operation = FilterModelOperation.Or;
      filter.conditions = [];

      const searchOptions = SearchOptionsHelper.getFilterRequest([filter]);
      searchOptions.endRow = 5;

      if(StringHelper.isIntegerString(query)) {
        searchOptions.filterModel[0].conditions = [SearchOptionsHelper.getNumberFilter('id', FilterTypes.Number, 'contains', Number(query))];
      }
      else {
        searchOptions.filterModel[0].conditions = [SearchOptionsHelper.getContainsFilter('name', FilterTypes.Text, 'contains', query)];
      }
      this.store.dispatch(actions.GetProjectsLightList({ params: searchOptions }));

    } else if (this.activeDropdownOption.id == EntityTypeEnum.Clients) {
      this.rootStore.dispatch(rootActions.QuickSearch({ query, page: 1, perPage: 5 }));
    } else if (this.activeDropdownOption.id == EntityTypeEnum.ProjectClaimantSummary) {
      const searchOptions = SearchOptionsHelper.getFilterRequest([new FilterModel()]);
      searchOptions.endRow = 5;
      searchOptions.filterModel[0] = { key: 'quickSearch', type: 'contains', filterType: 'text', filter: StringHelper.stripDashes(query), conditions: [], operation: null, dateFrom: null, dateTo: null, filterTo: null };

      let params:  IServerSideGetRowsParamsExtended = {
        parentNode: null,
        success() {},
        fail() {},
        api: null,
        context: null,
        request: searchOptions,
      }
      this.rootStore.dispatch(projectActions.GetClaimantsList({ projectId: this.activeDropdownOption.payload , agGridParams: params }));
    }
  }

  public onEnter() {
    const { searchText } = this;
    if (!searchText) return;
    this.resetSearch();

    switch (this.activeDropdownOption.id) {
      case EntityTypeEnum.Projects:
        this.router.navigate(['/projects'], {
          queryParams: LandingPageGlobalSearchComponent.getQueryParamsByQueryString(searchText.trim(), EntityTypeEnum.Projects)
        });
        break;
      case EntityTypeEnum.Clients:
        this.router.navigate(['/claimants'], {
          queryParams: LandingPageGlobalSearchComponent.getQueryParamsByQueryString(searchText.trim(), EntityTypeEnum.Clients)
        });
        break;
      case EntityTypeEnum.ProjectClaimantSummary:
        this.router.navigate(['/projects', this.activeDropdownOption.payload, 'claimants', 'tabs', 'overview'], {
          queryParams: LandingPageGlobalSearchComponent.getQueryParamsByQueryString(searchText.trim(), EntityTypeEnum.ProjectClaimantSummary)
        });
        break;
    }
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
    this.store.dispatch(actions.ClearProjectsLightList());
  }

  static getQueryParamsByQueryString(searchText: string, activeDropdownOptionId: EntityTypeEnum): Record<string, string> {

    if (activeDropdownOptionId == EntityTypeEnum.Projects) {
      if (StringHelper.isIntegerString(searchText)) {
        return {
          "filters.id": searchText
        }
      } else {
        return {
          "filters.name*": searchText
        }
      }
    } else if (activeDropdownOptionId == EntityTypeEnum.Clients || activeDropdownOptionId == EntityTypeEnum.ProjectClaimantSummary) {
        return {
          "filters.searchTerm": searchText
        }
    }
  }

  public getRouterLink(item: any): string {
    switch (this.activeDropdownOption.id) {
      case EntityTypeEnum.Projects:
        return `/projects/${item.id}/overview`;
      case EntityTypeEnum.Clients:
      case EntityTypeEnum.ProjectClaimantSummary:
        return `/claimants/${item.id}`;
    }
  }


  protected readonly EntityTypeEnum = EntityTypeEnum;
}