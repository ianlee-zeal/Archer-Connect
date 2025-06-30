import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy, ViewRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LienFinalizationService } from '@app/services';

import { PaginatorParams } from '@app/models';
import { Pager } from '@app/modules/shared/grid-pager/pager';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { SearchOptionsHelper } from '@app/helpers';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { SearchTypeEnum } from '@app/models/enums/filter-type.enum';
import { UrlHelper } from '@app/helpers/url-helper';
import { OnPage } from '@app/modules/shared/_interfaces';

import { commonSelectors } from '@shared/state/common.selectors';
import * as paginatorActions from '@shared/grid-pager/state/actions';
import * as fromShared from '@shared/state/common.actions';
import * as rootSelectors from '@app/state';
import * as lienFinalizationGridSelectors from '@app/modules/lien-finalization/lien-finalization-grid/state/selectors';
import * as lienFinalizationSelectors from '@app/modules/lien-finalization/state/selectors';
import * as actions from './state/actions';
import * as selectors from './state/selectors';
import { LienFinalizationState } from '../state/reducer';
import { LienFinalizationRun } from '@app/models/lien-finalization/lien-finalization-run';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Component({
  selector: 'finalization-details',
  templateUrl: './finalization-details.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class FinalizationDetailsComponent implements OnInit, OnDestroy, OnPage {
  public readonly pager$ = this.store.select(commonSelectors.pager);
  public readonly loadingInProgress$ = this.store.select(rootSelectors.loadingInProgress);
  public readonly actionBar$ = this.store.select(lienFinalizationSelectors.actionBar);
  public readonly lienFinalizationAgGridParams$ = this.store.select(lienFinalizationGridSelectors.agGridParams);
  public lienFinalizationDetailsHeader$ = this.store.select(selectors.finalizationDetailsHeader);
  public lienFinalizationAgGridParams;

  public title: string;
  public pager: Pager;
  public actionBar: ActionHandlersMap;
  public headerElements: ContextBarElement[];
  public routerUrl: string;
  public activeUrl: string[];

  private finalizationId: number;
  private readonly ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store<LienFinalizationState>,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly finalizationService: LienFinalizationService,
    private readonly changeRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.finalizationId = this.route.snapshot.params.id;
    this.routerUrl = this.router.url;
    this.activeUrl = this.router.url.split('/').map(x => x.toLowerCase());

    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      this.changeRef.detectChanges();
    }

    this.fillContextBarData();

    this.lienFinalizationAgGridParams$
      .pipe(
        filter(gridParams => !!gridParams),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(gridParams => {
        this.lienFinalizationAgGridParams = gridParams;
      });

    this.startFinalizationDetailsLoading();
  }

  private fillContextBarData(): void {
    this.lienFinalizationDetailsHeader$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(finalization => {
      if (!finalization ) {
        this.getFinalizationDetailsInfo(this.route.snapshot.params.id);
      } else {
        this.title = "Finalization Details";
        this.headerElements = [
          { column: 'Batch ID', valueGetter: () => finalization.id },
        ];
      }
    });
  }

  public getFinalizationDetailsInfo(id: number) {
    const searchOptions: IServerSideGetRowsRequestExtended = SearchOptionsHelper.getFilterRequest([
      SearchOptionsHelper.getContainsFilter('id', FilterTypes.Number, SearchTypeEnum.Equals, id.toString()),
    ]);
    searchOptions.endRow = 1;

    this.store.dispatch(actions.GetFinalizationDetails({ searchOptions }));
  }

  public toPage(pageNumber: number): void {
    this.startFinalizationDetailsLoading();
    this.store.dispatch(fromShared.UpdatePager({ pager: { currentPage: pageNumber } }));
    this.store.dispatch(paginatorActions.PaginatorToObject({
      pageNumber,
      apiCall: this.finalizationService.search.bind(this.finalizationService),
      callback: this.paginatorCallBack.bind(this),
      params: <PaginatorParams>{ gridParams: this.lienFinalizationAgGridParams.request },
    }));
  }

  private paginatorCallBack(finalization: LienFinalizationRun) {
    this.store.dispatch(actions.GetFinalizationDetailsComplete({ item: finalization }));
    const urlArray: string[] = UrlHelper.getUrlArrayForPager(this.finalizationId, finalization.id, this.router.url);
    this.router.navigate(urlArray);

    this.finalizationId = finalization.id;
  }

  private startFinalizationDetailsLoading() {
    this.store.dispatch(actions.GetFinalizationDetailsLoadingStarted());
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.store.dispatch(actions.ResetFinalizationDetails());
  }
}
