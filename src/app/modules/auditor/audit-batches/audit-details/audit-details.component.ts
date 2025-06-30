import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy, ViewRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuditorService } from '@app/services';

import { AuditorState } from '@app/modules/auditor/state/reducer';

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
import { AuditRun } from '@app/models/auditor/audit-run';
import * as auditBatchesSelectors from '@app/modules/auditor/audit-batches/state/selectors';
import * as auditorSelectors from '@app/modules/auditor/state/selectors';
import * as actions from './state/actions';
import * as selectors from './state/selectors';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Component({
  selector: 'audit-details',
  templateUrl: './audit-details.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AuditDetailsComponent implements OnInit, OnDestroy, OnPage {
  public readonly pager$ = this.store.select(commonSelectors.pager);
  public readonly loadingInProgress$ = this.store.select(rootSelectors.loadingInProgress);
  public readonly actionBar$ = this.store.select(auditorSelectors.actionBar);
  public readonly auditBatchesAgGridParams$ = this.store.select(auditBatchesSelectors.agGridParams);
  public auditDetailsHeader$ = this.store.select(selectors.auditDetailsHeader);
  public auditBatchesAgGridParams;

  public title: string;
  public pager: Pager;
  public actionBar: ActionHandlersMap;
  public headerElements: ContextBarElement[];
  public routerUrl: string;
  public activeUrl: string[];

  private auditRunId: number;
  private readonly ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store<AuditorState>,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly auditorService: AuditorService,
    private readonly changeRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.auditRunId = this.route.snapshot.params.id;
    this.routerUrl = this.router.url;
    this.activeUrl = this.router.url.split('/').map(x => x.toLowerCase());

    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      this.changeRef.detectChanges();
    }

    this.fillContextBarData();

    this.auditBatchesAgGridParams$
      .pipe(
        filter(gridParams => !!gridParams),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(gridParams => {
        this.auditBatchesAgGridParams = gridParams;
      });

    this.startAuditDetailsLoading();
  }

  private fillContextBarData(): void {
    this.auditDetailsHeader$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(auditRun => {
      if (!auditRun) {
        this.getAuditDetailsInfo(this.route.snapshot.params.id);
      } else {
        this.title = auditRun.inputDocument?.fileName;
        this.headerElements = [
          { column: 'Batch ID', valueGetter: () => auditRun.batchNumber },
        ];
      }
    });
  }

  public getAuditDetailsInfo(id: number) {
    const searchOptions: IServerSideGetRowsRequestExtended = SearchOptionsHelper.getFilterRequest([
      SearchOptionsHelper.getContainsFilter('id', FilterTypes.Number, SearchTypeEnum.Equals, id.toString()),
    ]);
    searchOptions.endRow = 1;

    this.store.dispatch(actions.GetAuditDetails({ searchOptions }));
  }

  public toPage(pageNumber: number): void {
    this.startAuditDetailsLoading();
    this.store.dispatch(fromShared.UpdatePager({ pager: { currentPage: pageNumber } }));
    this.store.dispatch(paginatorActions.PaginatorToObject({
      pageNumber,
      apiCall: this.auditorService.search.bind(this.auditorService),
      callback: this.paginatorCallBack.bind(this),
      params: <PaginatorParams>{ gridParams: this.auditBatchesAgGridParams.request },
    }));
  }

  private paginatorCallBack(auditRun: AuditRun) {
    this.store.dispatch(actions.GetAuditDetailsComplete({ item: auditRun }));
    const urlArray: string[] = UrlHelper.getUrlArrayForPager(this.auditRunId, auditRun.id, this.router.url);
    this.router.navigate(urlArray);

    this.auditRunId = auditRun.id;
  }

  private startAuditDetailsLoading() {
    this.store.dispatch(actions.GetAuditDetailsLoadingStarted());
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.store.dispatch(actions.ResetAuditDetails());
  }
}
