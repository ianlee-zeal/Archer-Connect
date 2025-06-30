/* eslint-disable no-restricted-globals */
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';

import { Settlement, PaginatorParams } from '@app/models';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { NavigationSettings } from '@app/modules/shared/action-bar/navigation-settings';
import { SettlementsService } from '@app/services';
import { sharedActions, sharedSelectors } from '@app/modules/shared/state';

import { commonSelectors } from '@shared/state/common.selectors';
import * as fromShared from '@shared/state/common.actions';
import * as paginatorActions from '@shared/grid-pager/state/actions';
import * as settlementsSharedActions from '@shared/state/settlement-info/actions';
import * as rootSelectors from '@app/state';
import * as fromSettlements from '../state';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Component({
  selector: 'app-settlement-details',
  templateUrl: './settlement-details.component.html',
})
export class SettlementDetailsComponent implements OnInit, OnDestroy {
  @Input() public id: number;

  public actionBar$ = this.store.select(fromSettlements.selectors.actionBar);
  public gridParams$ = this.store.select(fromSettlements.selectors.agGridParams);
  readonly pager$ = this.store.select(commonSelectors.pager);

  public settlement: Settlement;
  public title: string;
  public headerElements: ContextBarElement[];
  public navigationSettings: NavigationSettings;
  private gridParams: IServerSideGetRowsRequestExtended;

  public settlementInfoHeader$ = this.store.select(sharedSelectors.settlementInfoSelectors.settlementInfoHeader);
  public allSettlements$ = this.store.select(fromSettlements.selectors.settlements);
  public loadingInProgress$ = this.store.select(rootSelectors.loadingInProgress);

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<fromSettlements.SettlementState>,
    private activatedRoute: ActivatedRoute,
    private settlementsService: SettlementsService,
  ) { }

  public ngOnInit(): void {
    this.id = +this.activatedRoute.snapshot.params.id;

    if (!this.id) {
      return;
    }

    this.fillContextBarData();

    this.store.dispatch(sharedActions.settlementInfoActions.GetSettlementInfo({ id: this.id }));
    this.store.dispatch(fromSettlements.actions.UpdatePreviousSettlementId({ prevSettlementId: history.state.prevSettlementId }));
    this.store.dispatch(fromSettlements.actions.UpdatePreviousSettlementUrl({ settlementPreviousUrl: history.state.settlementPreviousUrl }));

    this.gridParams$
      .pipe(
        filter(p => p !== null),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(params => {
        this.gridParams = params.request;
      });

    this.startSettlementLoading();
  }

  private fillContextBarData(): void {
    this.settlementInfoHeader$.pipe(
      filter(settlement => settlement != null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(settlement => {
      this.title = settlement.name;
      this.headerElements = [
        { column: 'Id', valueGetter: () => settlement.id },
      ];
    });
  }

  public toPage(pageNumber: number): void {
    this.store.dispatch(fromShared.UpdatePager({ pager: { currentPage: pageNumber } }));
    this.store.dispatch(paginatorActions.Paginator({
      pageNumber,
      prevId: this.activatedRoute.snapshot.params.id,
      apiCall: this.settlementsService.search.bind(this.settlementsService),
      callback: this.paginatorCallBack.bind(this),
      params: <PaginatorParams>{ gridParams: this.gridParams },
    }));

    this.startSettlementLoading();
  }

  private paginatorCallBack(id: number) {
    this.store.dispatch(settlementsSharedActions.GetSettlementInfo({ id }));
  }

  private startSettlementLoading() {
    this.store.dispatch(settlementsSharedActions.GetSettlementLoadingStarted());
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
