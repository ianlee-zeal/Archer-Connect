/* eslint-disable no-restricted-globals */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { MattersService } from '@app/services/api/matters.service';
import { commonSelectors } from '@shared/state/common.selectors';

import { PaginatorParams } from '@app/models/paginator-params';

import * as paginatorActions from '@shared/grid-pager/state/actions';
import * as fromShared from '@shared/state/common.actions';

import { OnPage } from '@app/modules/shared/_interfaces';
import * as rootSelectors from '@app/state';

import { agGridParams } from '../state/selectors';
import { MatterState } from '../state/reducer';
import { actions } from '../state';
import * as selectors from '../state/selectors';

@Component({
  selector: 'app-matter-details',
  templateUrl: './matter-details.component.html',
  styleUrls: ['./matter-details.component.scss'],
})
export class MatterDetailsComponent implements OnInit, OnDestroy, OnPage {
  public loadingInProgress$ = this.store.select(rootSelectors.loadingInProgress);
  readonly pager$ = this.store.select(commonSelectors.pager);
  private ngUnsubscribe$ = new Subject<void>();
  private matterId: number;
  public title: string;
  public matter$ = this.store.select(selectors.matter);
  public agGridParams$ = this.store.select(agGridParams);
  public readonly actionBar$ = this.store.select(selectors.actionBar);
  public agGridParams;

  constructor(
    private readonly store: Store<MatterState>,
    private readonly mattersService: MattersService,
    private readonly route: ActivatedRoute,
  ) {
  }

  public ngOnInit(): void {
    this.startMatterLoading();
    this.matterId = this.route.snapshot.params.id;
    this.loadMatter(this.matterId);

    this.addMatterListener();

    this.agGridParams$
      .pipe(
        filter(gridParams => !!gridParams),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(gridParams => {
        this.agGridParams = gridParams;
      });
  }

  private addMatterListener(): void {
    this.matter$
      .pipe(
        filter(matter => !!matter),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(matter => {
        this.title = matter.name;
      });
  }

  public toPage(pageNumber: number): void {
    this.startMatterLoading();
    this.store.dispatch(fromShared.UpdatePager({ pager: { currentPage: pageNumber } }));
    this.store.dispatch(paginatorActions.Paginator({
      pageNumber,
      prevId: this.route.snapshot.params.id,
      apiCall: this.mattersService.search.bind(this.mattersService),
      callback: this.paginatorCallBack.bind(this),
      params: <PaginatorParams>{ gridParams: this.agGridParams.request },
    }));
  }

  private paginatorCallBack(id: number) {
    this.store.dispatch(actions.GetMatter({ matterId: id }));
  }

  private startMatterLoading() {
    this.store.dispatch(actions.GetMatterLoadingStarted());
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private loadMatter(id: number) {
    this.store.dispatch(actions.GetMatter({ matterId: id }));
  }
}
