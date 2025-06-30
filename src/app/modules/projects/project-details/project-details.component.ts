import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionsSubject, Store } from '@ngrx/store';
import { takeUntil, filter, first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { ProjectsService, PaymentsSearchService, PermissionService, ProjectCommunicationService, CommunicationService } from '@app/services';
import { RecentView, Project, PinnedPage, PaginatorParams, CommunicationRecord } from '@app/models';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { Pager } from '@app/modules/shared/grid-pager/pager';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { LPMHelper } from '@app/helpers/lpm.helper';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { UrlHelper } from '@app/helpers/url-helper';
import { OnPage } from '@app/modules/shared/_interfaces';
import { RelatedPage } from '@app/modules/shared/grid-pager';

import { commonSelectors } from '@shared/state/common.selectors';
import * as paginatorActions from '@shared/grid-pager/state/actions';
import * as recentViewActions from '@shared/state/recent-views/actions';
import * as pinnedPagesActions from '@app/modules/shared/state/pinned-pages/actions';
import * as fromShared from '@shared/state/common.actions';
import * as rootSelectors from '@app/state';
import { ofType } from '@ngrx/effects';
import { GetNotesListComplete } from '@app/modules/shared/state/notes-list/actions';
import { communicationSelectors } from '@app/modules/call-center/communication/state/selectors';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { GoToCommunication } from '@app/modules/dashboard/communications/state/actions';
import { ProjectCommunicationRecord } from '@app/models/communication-center/project-communication-record';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import * as fromProjects from '../state';
import * as paymentActions from '../../payments/state/actions';
import * as communicationActions from '../../call-center/communication/state/actions';
import { GetProjectCommunicationRecordRequest } from '../../call-center/communication/state/actions';

@Component({
  selector: 'project-details',
  templateUrl: './project-details.component.html',
})
export class ProjectDetailsComponent implements OnInit, OnDestroy, OnPage {
  public readonly item$ = this.store.select(selectors.item);
  public readonly services$ = this.store.select(selectors.services);
  public readonly actionBar$ = this.store.select(selectors.actionBar);
  public readonly contextBar$ = this.store.select(selectors.contextBar);
  public readonly gridParams$ = this.store.select(selectors.projectGridParams);
  public readonly error$ = this.store.select(selectors.error);
  public readonly pager$ = this.store.select(commonSelectors.pager);
  private readonly communicationRecord$ = this.store.select(communicationSelectors.currentCommunicationRecord);
  public loadingInProgress$ = this.store.select(rootSelectors.loadingInProgress);
  public showInfoBar$ = this.store.select(selectors.showInfoBar);

  public project: Project;
  public title: string;
  public pager: Pager;
  public actionBar: ActionHandlersMap;
  public headerElements: ContextBarElement[];
  public activeUrl: string[];
  private projectId: number;
  private isPinned: boolean;
  private gridParams: IServerSideGetRowsParamsExtended;
  private communicationId: number | null;
  private readonly ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store<fromProjects.AppState>,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly projectsService: ProjectsService,
    private readonly paymentsService: PaymentsSearchService,
    private readonly projectCommunicationsService: ProjectCommunicationService,
    private readonly communicationService: CommunicationService,
    private readonly actionsSubj: ActionsSubject,
    private readonly dateFormatPipe: DateFormatPipe,
  ) { }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.params.id;
    this.activeUrl = this.router.url.split('/').map((x: string) => x.toLowerCase());

    this.store.dispatch(actions.GetItem({ id: this.projectId }));
    this.store.dispatch(actions.GetProjectCounts({ projectId: this.projectId }));
    this.item$
      .pipe(
        filter((item: Project) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((item: Project) => {
        this.project = item;
        this.title = item.name;
        this.projectId = item.id;
        this.isPinned = item.isPinned;

        this.setHeader(item);
        this.refreshActionBar();
        this.logPageViewedEvent();
      });

    this.addContextBarListener();
    this.addCommunicationListener();
    this.addGridParamsListener();
    this.addActionBarListener();
    this.addTabsCountListeners();
    this.startProjectLoading(true);
  }

  private addContextBarListener(): void {
    this.contextBar$.pipe(
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe((contextBar: ContextBarElement[]) => {
        if (contextBar) {
          this.headerElements = contextBar;
        } else {
          this.setHeader(this.project);
        }
      });
  }

  private addCommunicationListener(): void {
    this.communicationRecord$
      .pipe(
        filter((communication: CommunicationRecord | ProjectCommunicationRecord) => !!communication),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((communication: CommunicationRecord | ProjectCommunicationRecord) => {
        const headers = [];

        headers.push({
          column: 'Communication Log ID',
          valueGetter: () => (communication.id ? communication.id : 'New Entry'),
        });

        if (communication.id) {
          headers.push({
            column: 'Last Modified By',
            valueGetter: () => communication.lastModifiedBy?.displayName,
          });

          headers.push({
            column: 'Last Modified Date',
            valueGetter: () => this.dateFormatPipe.transform(communication.lastModifiedDate),
          });
        }
        this.store.dispatch(actions.UpdateContextBar({ contextBar: headers }));

        this.communicationId = communication.id;
      });
  }

  private addActionBarListener(): void {
    this.actionBar$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((actionBar: ActionHandlersMap) => { this.actionBar = this.getActionBarContent(actionBar); });

    this.refreshActionBar();
  }

  private addGridParamsListener(): void {
    this.gridParams$
      .pipe(
        filter((p: IServerSideGetRowsParamsExtended) => !!p),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((params: IServerSideGetRowsParamsExtended) => { this.gridParams = params; });
  }

  private getActionBarContent(actionBar: ActionHandlersMap): ActionHandlersMap {

    if (actionBar?.back && Object.keys(actionBar).length === 1) {
      return { back: () => this.onBackClicked() };
    }

    return {
      ...actionBar,
      back: !!actionBar?.back ? actionBar?.back : this.onBackClicked.bind(this),
      ...this.getCommonBarActions(),
    };
  }

  private getCommonBarActions(): ActionHandlersMap {
    return {
      removePin: {
        callback: () => this.store.dispatch(pinnedPagesActions.RemovePinnedPage({
          entityId: this.projectId,
          entityType: EntityTypeEnum.Projects,
          callback: () => {
            this.isPinned = false;
          },
        })),
        hidden: () => !this.isPinned,
      },

      pinPage: {
        callback: () => this.store.dispatch(pinnedPagesActions.CreatePinnedPage({
          view: <PinnedPage>{
            entityId: this.projectId,
            entityTypeId: EntityTypeEnum.Projects,
            url: `/projects/${this.projectId}`,
          },
          callback: () => {
            this.isPinned = true;
          },
        })),
        hidden: () => this.isPinned,
      },

      viewInLPM: {
        callback: () => LPMHelper.viewInLPM('/#case-details', { caseId: this.projectId }),
        permissions: PermissionService.create(PermissionTypeEnum.Projects, PermissionActionTypeEnum.ViewInLPM),
      },
    };
  }

  private logPageViewedEvent(): void {
    this.store.dispatch(recentViewActions.CreateRecentView({
      view: <RecentView>{
        entityId: this.projectId,
        entityTypeId: EntityTypeEnum.Projects,
        url: `/projects/${this.projectId}`,
      },
    }));
  }

  private refreshActionBar(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
  }

  private setHeader(item: Project): void {
    if (item) {
      this.store.dispatch(actions.UpdateContextBar({
        contextBar: [
          { column: 'Type', valueGetter: () => item.projectType?.name },
          { column: 'Tort',
            routerLink: {
              text: item.matter,
              routerLink: this.router.createUrlTree(['dashboard', 'matters', item.tortId, 'tabs', 'matter-information']).toString(),
              hidden: false,
              showInValueBar: true,
            },
          },
          { column: 'ID', valueGetter: () => item.id },
        ],
      }));
    }
  }

  private onBackClicked(): void {
    this.pager$.pipe(
      first(),
    ).subscribe((pager: Pager) => {
      if (!pager) {
        this.store.dispatch(GotoParentView());
        return;
      }

      switch (pager.relatedPage) {
        case RelatedPage.PaymentsFromProject: {
          const payload = <paymentActions.IEntityPaymentsPayload> pager.payload;
          this.store.dispatch(paymentActions.GoToPaymentsList({ payload }));
          this.store.dispatch(fromShared.ActivatePager({ relatedPage: payload.parentPage }));
          break;
        }

        case RelatedPage.ProjectsFromSearch: {
          this.router.navigate(['projects']);
          break;
        }

        case RelatedPage.ProjectCommunications:
          this.router.navigate(['projects', this.projectId, 'overview', 'tabs', 'communications']);
          break;

        default:
          this.store.dispatch(GotoParentView());
          break;
      }
    });
  }

  public toPage(pageNumber: number): void {
    this.store.dispatch(fromShared.UpdatePager({ pager: { currentPage: pageNumber } }));
    this.pager$.pipe(first()).subscribe((pager: Pager) => {
      switch (pager.relatedPage) {
        case RelatedPage.PaymentsFromProject: {
          const payload = <paymentActions.IEntityPaymentsPayload> { ...pager.payload };
          const otherParams = [];
          otherParams.push(payload.entityId);
          otherParams.push(payload.entityType);
          this.store.dispatch(paginatorActions.Paginator({
            pageNumber,
            prevId: UrlHelper.getId(this.router.url),
            apiCall: this.paymentsService.searchEntityPayments.bind(this.paymentsService),
            callback: (paymentId: number) => {
              this.store.dispatch(paymentActions.GetPaymentDetails({ paymentId }));
            },
            params: <PaginatorParams>{
              gridParams: payload.agGridParams.request,
              otherParams,
            },
          }));
          break;
        }

        case RelatedPage.GlobalCommunicationSearch: {
          const payload = <communicationActions.IEntityCommunicationsPayload> { ...pager.payload };
          const otherParams = [];
          otherParams.push(payload.entityId);
          this.store.dispatch(paginatorActions.PaginatorToObject({
            pageNumber,
            apiCall: this.communicationService.search.bind(this.communicationService),
            callback: this.paginatorCommunicationsCallBack.bind(this),
            params: <PaginatorParams>{
              gridParams: payload.agGridParams.request,
              otherParams,
            },
          }));
          break;
        }

        case RelatedPage.ProjectCommunications: {
          const payload = <communicationActions.IEntityCommunicationsPayload> { ...pager.payload };
          const otherParams = [];
          otherParams.push(payload.entityId);
          this.store.dispatch(paginatorActions.Paginator({
            pageNumber,
            prevId: this.route.snapshot.params.id,
            apiCall: this.projectCommunicationsService.searchCommunications.bind(this.projectCommunicationsService),
            callback: this.paginatorCommunicationsCallBack.bind(this),
            params: <PaginatorParams>{
              gridParams: payload.agGridParams.request,
              otherParams,
            },
          }));
          break;
        }

        default: {
          this.startProjectLoading(false);
          this.store.dispatch(paginatorActions.Paginator({
            pageNumber,
            prevId: this.route.snapshot.params.id,
            apiCall: this.projectsService.search.bind(this.projectsService),
            callback: this.paginatorCallBack.bind(this),
            params: <PaginatorParams>{ gridParams: this.gridParams.request },
          }));
          break;
        }
      }
    });
  }

  private paginatorCallBack(id: number): void {
    const urlArray: string[] = UrlHelper.getUrlArrayForPager(this.projectId, id, this.router.url);
    this.router.navigate(urlArray);
    this.store.dispatch(actions.GetItem({ id }));
    this.store.dispatch(actions.GetProjectCounts({ projectId: id }));
  }

  private paginatorCommunicationsCallBack(data: CommunicationRecord): void {
    const comm: CommunicationRecord = CommunicationRecord.toModel(data);
    switch (comm.entityTypeId) {
      case EntityTypeEnum.Projects:
        this.communicationId = comm.id;
        this.router.navigate(UrlHelper.getUrlArrayForPager(this.communicationId, comm.id, this.router.url));
        this.store.dispatch(GetProjectCommunicationRecordRequest({ projectCommunicationRecordId: comm.id }));
        break;
      case EntityTypeEnum.Clients:
        this.store.dispatch(GoToCommunication({ entityId: comm.claimantId, entityTypeId: comm.entityTypeId, id: comm.id, canReadNotes: false }));
        break;
    }
  }

  private startProjectLoading(addAdditionalActions: boolean): void {
    const additionalActionNames = [];

    if (this.activeUrl.pop() === 'overview'
        && !this.activeUrl.includes('claimants')
        && addAdditionalActions) {
      additionalActionNames.push(
        // actions.GetProjectOverviewDashboardClaimantDetails.type,
        actions.GetProjectOverviewDashboardClaimantDetailsByPhase.type,
        actions.GetProjectOverviewDashboardClaimantStatistic.type,
      );
    }

    this.store.dispatch(actions.GetProjectLoadingStarted({ additionalActionNames }));
  }

  private addTabsCountListeners(): void {
    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        GetNotesListComplete,
        actions.GetItemComplete,
      ),
    ).subscribe(() => this.store.dispatch(actions.GetTabCounts({ projectId: this.projectId })));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
