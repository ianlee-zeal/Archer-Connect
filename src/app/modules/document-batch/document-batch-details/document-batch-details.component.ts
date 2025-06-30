import { Component, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { DocumentBatchState } from "../state/reducer";
import * as documentBatchSelectors from '@app/modules/document-batch/state/selectors';
import { commonSelectors } from '@shared/state/common.selectors';
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { filter, first, takeUntil } from "rxjs/operators";
import * as actions from '@app/modules/document-batch/state/actions';
import { ContextBarElement } from "@app/entities";
import { ActionHandlersMap } from "@app/modules/shared/action-bar/action-handlers-map";
import { Pager } from "@app/modules/shared/grid-pager";
import { GotoParentView } from "@app/modules/shared/state/common.actions";
import * as fromShared from '@shared/state/common.actions';
import * as paginatorActions from '@shared/grid-pager/state/actions';
import { PaginatorParams } from "@app/models";
import * as rootSelectors from '@app/state';
import { DocumentBatchService } from "@app/services/api/document-batch.service";
import * as documentBatchActions from '../state/actions';
import { DocumentBatchDetailsResponse } from "@app/models/document-batch-get/get-single-batch/document-batch-details-response";
import { IServerSideGetRowsParamsExtended } from "@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params";

@Component({
  selector: 'app-document-batch-details',
  templateUrl: './document-batch-details.component.html',
  styleUrls: ['./document-batch-details.component.scss']
})
export class DocumentBatchDetailsComponent implements OnInit, OnDestroy {
  public readonly pager$ = this.store.select(commonSelectors.pager);
  public readonly actionBar$ = this.store.select(documentBatchSelectors.actionBar);
  public readonly batchDetails$ = this.store.select(documentBatchSelectors.getBatchDetails);
  public readonly gridParams$ = this.store.select(documentBatchSelectors.agGridParams);
  public readonly loadingInProgress$ = this.store.select(rootSelectors.loadingInProgress);

  private destroy$ = new Subject<void>();
  private batchId: number;
  private gridParams: IServerSideGetRowsParamsExtended;

  public title: string;
  public batchDetails: DocumentBatchDetailsResponse;
  public headerElements: ContextBarElement[];
  public actionBar: ActionHandlersMap;

  constructor(
    private readonly store: Store<DocumentBatchState>,
    private route: ActivatedRoute,
    private readonly documentBatchService: DocumentBatchService,
  ) { }

  ngOnInit(): void {
    this.startLoading();

    this.route.params.pipe(
      filter(params => params != null),
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const batchId = params['id'];
      this.batchId = batchId;

      this.store.dispatch(actions.GetBatchDetails({ batchId: this.batchId }))
    });

    this.batchDetails$
      .pipe(
        filter(batchDetails => batchDetails != null),
        takeUntil(this.destroy$)
      )
      .subscribe(batchDetails => {
        this.batchDetails = batchDetails;
        this.title = `Document Batch ${this.batchDetails.id}`;
      });

    this.addActionBarListener();
    this.addGridParamsListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getActionBarContent(actionBar: ActionHandlersMap): ActionHandlersMap {
    if (actionBar?.back && Object.keys(actionBar).length === 1) {
      return { back: () => this.onBack() };
    }
    return {
      back: actionBar?.back || ((): void => this.onBack()),
      ...actionBar,
    };
  }

  private onBack(): void {
    this.pager$.pipe(
      first(),
    ).subscribe((pager: Pager) => {
      if (!pager) {
        this.store.dispatch(GotoParentView());
        return;
      }

      switch (pager.relatedPage) {
        default:
          this.store.dispatch(GotoParentView());
          break;
      }
    });
  }

  private addActionBarListener(): void {
    this.actionBar$
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe((actionBar: ActionHandlersMap) => { this.actionBar = this.getActionBarContent(actionBar); });

    this.refreshActionBar();
  }

  private refreshActionBar(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
  }

  public toPage(pageNumber: number): void {
    this.store.dispatch(fromShared.UpdatePager({ pager: { currentPage: pageNumber } }));
    this.pager$.pipe(first()).subscribe(() => {
      this.store.dispatch(paginatorActions.Paginator({
        pageNumber,
        prevId: this.route.snapshot.params.id,
        apiCall: this.documentBatchService.searchBatches.bind(this.documentBatchService),
        callback: (batchId: number) => {
          this.store.dispatch(documentBatchActions.GetBatchDetails({ batchId: batchId }));
        },
        params: <PaginatorParams>{ gridParams: this.gridParams.request },
      }));
    });
  }

  private addGridParamsListener(): void {
    this.gridParams$
      .pipe(
        filter((p: IServerSideGetRowsParamsExtended) => !!p),
        takeUntil(this.destroy$),
      )
      .subscribe((params: IServerSideGetRowsParamsExtended) => { this.gridParams = params; });
  }

  private startLoading(): void {
    const additionalActionNames = [documentBatchActions.GetBatchDetails.type]
    this.store.dispatch(actions.GetBatchDetailsLoadingStarted({ additionalActionNames }));
  }
}