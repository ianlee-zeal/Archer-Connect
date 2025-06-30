import { BsModalRef } from 'ngx-bootstrap/modal';
/* eslint-disable no-restricted-globals */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { filter, first, takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { Subject } from 'rxjs';

import { sharedSelectors, sharedActions } from '@shared/state';
import { NavigationSettings } from '@shared/action-bar/navigation-settings';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { communicationListSelectors } from '@app/modules/call-center/communication-list/state/selectors';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum, ProductCategory } from '@app/models/enums';
import { RecentView, PinnedPage, CallInfo, ProbateDetails, Person, IdValue } from '@app/models';
import { CallCenterState } from '@app/modules/call-center/state/reducer';
import { ClientsService, ProjectsService, PermissionService, ModalService, PaymentsSearchService, CommunicationService, ToastService } from '@app/services';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { commonSelectors } from '@shared/state/common.selectors';
import { Pager, RelatedPage } from '@app/modules/shared/grid-pager';
import { GotoParentView } from '@shared/state/common.actions';
import { communicationSelectors } from '@app/modules/call-center/communication/state/selectors';

import { PaginatorParams } from '@app/models/paginator-params';
import { LPMHelper } from '@app/helpers/lpm.helper';

import * as widgetActions from '@app/modules/call-center/call-widget/state/actions';
import * as callWidgetSelectors from '@app/modules/call-center/call-widget/state/selectors';
import * as paginatorActions from '@shared/grid-pager/state/actions';
import * as recentViewActions from '@shared/state/recent-views/actions';
import * as pinnedPagesActions from '@app/modules/shared/state/pinned-pages/actions';
import * as fromShared from '@shared/state/common.actions';
import { DeleteAddressSuccess } from '@app/modules/addresses/add-address-modal/state/actions';
import { GetAddressesListComplete } from '@app/modules/addresses/address-list/state/actions';
import { GetAllPersonContactsSuccess } from '@app/modules/dashboard/persons/contacts/state/actions';
import { GetDocumentsListComplete } from '@app/modules/shared/state/documents-list/actions';
import { GetNotesListComplete } from '@app/modules/shared/state/notes-list/actions';

import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { UrlHelper } from '@app/helpers/url-helper';
import { ClaimantDetailsRequest } from '@app/modules/shared/_abstractions';
import { OnPage } from '@app/modules/shared/_interfaces';
import { GetCommunicationListRequest, GetCommunicationListSuccess, IGetCommunicationListRequestParams } from '@app/modules/call-center/communication-list/state/actions';
import * as rootSelectors from '@app/state';
import { CommunicationRecord } from '@app/models/communication-center';
import { GoToCommunication } from '@app/modules/dashboard/communications/state/actions';
import { GetCommunicationDetailsLoadingStarted, GetCommunicationRecordRequest } from '@app/modules/call-center/communication/state/actions';
import { Claimant } from '@app/models/claimant';
import { ActivityStatus } from '@app/models/activity-status';
import { HoldType } from '@app/models/hold-type';
import { ClientPaymentHold } from '@app/models/client-payment-hold';
import { GoToProbateDetails } from '@app/modules/probates/state/actions';
import { ClaimantsSummaryService } from '@app/services/api/claimants-summary.service';
import { ClaimantSummary } from '@app/models/claimant-summary';
import { ProjectCommunicationRecord } from '@app/models/communication-center/project-communication-record';
import { GetClaimantIdentifiersSuccess, GetClaimantIdSummarySuccess } from './state/actions';
import { GoToClaimantsListPage } from '../state/actions';
import { ClaimantDetailsState } from './state/reducer';

import * as addressActions from '../../addresses/state';
import * as paymentActions from '../../payments/state/actions';
import * as fromClaimants from './state/selectors';
import * as actions from './state/actions';
import * as claimantActions from '../state/actions';
import { HoldPaymentsModalComponent } from './hold-payments-modal/hold-payments-modal.component';
import { ProbatesService } from '../../../services/api/probates.service';
import { DisbursementClaimantSummary } from '../../../models/disbursement-claimant-summary';
import { ClaimantMessagingModalComponent } from './claimant-messaging-modal/claimant-messaging-modal.component';

@Component({
  selector: 'app-claimant-details',
  templateUrl: './claimant-details.component.html',
  styleUrls: ['./claimant-details.component.scss'],
})
export class ClaimantDetailsComponent implements OnInit, OnDestroy, OnPage {
  public showInfoBar$ = this.store.select(fromClaimants.showInfoBar);

  public item$ = this.store.select(fromClaimants.item);
  public headerElements$ = this.store.select(fromClaimants.headerElements);
  public showSpecialDesignationsBar$ = this.store.select(fromClaimants.showSpecialDesignationsBar);
  public actionBar$ = this.store.select(fromClaimants.actionBar);
  public clientWorkflow$ = this.store.select(fromClaimants.clientWorkflow);
  public loadingInProgress$ = this.store.select(rootSelectors.loadingInProgress);
  public personDetailsHeader$ = this.store.select(sharedSelectors.personGeneralInfoSelectors.personDetailsHeader);
  public communicationActionBar$ = this.store.select(communicationListSelectors.actionBar);
  readonly pager$ = this.store.select(commonSelectors.pager);
  public holdTypes$ = this.store.select(fromClaimants.holdTypes);
  private ngUnsubscribe$ = new Subject<void>();

  public title: string;
  public subTitle: string;
  public actionBar: ActionHandlersMap;
  public headerElements: ContextBarElement[];
  public holdStatusHeader: ContextBarElement;
  public navigationSettings: NavigationSettings;
  public isChildTabsShown: boolean = false;
  public readonly tabs = { details: 'details', contacts: 'contacts' };
  public isContextBarExpandable: boolean = true;
  public status: ActivityStatus;
  private claimantId: number;
  private personId: number;
  private isPinned: boolean;
  private activeTab: string;
  private callWidgetInfo: CallInfo;
  private holdTypes: HoldType[];
  private clientPaymentHold: ClientPaymentHold;
  private communicationRecord: CommunicationRecord;

  private claimantDetailsRequest$ = this.store.select(fromClaimants.claimantDetailsRequest);
  private claimantSummary$ = this.store.select(fromClaimants.claimantSummary);
  private clientPaymentHold$ = this.store.select(fromClaimants.clientPaymentHold);
  private claimantDetailsRequest: ClaimantDetailsRequest;
  private claimantSummary: ClaimantSummary;
  private claimantMessagingModal: BsModalRef;

  private readonly communicationRecord$ = this.store.select(communicationSelectors.currentCommunicationRecord);

  private readonly canViewAuditInfoPermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.AuditInfo, PermissionActionTypeEnum.ClaimantCommunications));

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private readonly callCenterStore: Store<CallCenterState>,
    private readonly clientsService: ClientsService,
    private readonly projectsService: ProjectsService,
    private readonly probatesService: ProbatesService,
    private readonly paymentsService: PaymentsSearchService,
    private readonly modalService: ModalService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly actionsSubj: ActionsSubject,
    private readonly dateFormatPipe: DateFormatPipe,
    private readonly communicationService: CommunicationService,
    private readonly claimantsSummaryService: ClaimantsSummaryService,
    private readonly toaster: ToastService,
    private readonly permissionService: PermissionService,
  ) {
    // AC-5352 - should be in constructor so router.getCurrentNavigation() would work correctly.
    this.initNavigationStateData();
  }

  public ngOnInit(): void {
    this.claimantId = Number(this.route.snapshot.params.id);
    this.store.dispatch(actions.GetHoldTypes());

    this.initClaimantDetailsSubscription();

    this.checkTab();
    this.startClaimantLoading();
    this.loadClaimant(this.claimantId);

    this.addClaimantListener();
    this.addCallInfoListener();
    this.addCommunicationListener();
    this.addHeaderListener();
    this.addActionBarListener();
    this.addActionsSubjListener();

    if (this.router.url.indexOf(`services/${ProductCategory.Probate}`) < 0) {
      this.addTabsCountListeners();
    }

    this.addHoldTypesListener();
    this.addClientPaymentHoldListener();
  }

  private addClaimantListener(): void {
    this.item$
      .pipe(
        filter((item: Claimant) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((claimant: Claimant) => {
        this.claimantId = claimant.id;
        this.title = claimant.fullName;
        this.subTitle = claimant.project && claimant.project.name;
        this.personId = claimant.personId;
        this.isPinned = claimant.isPinned;
        this.status = {
          statusName: claimant?.status?.name,
          inactiveReason: claimant?.inactiveReason?.name,
          inactiveDate: claimant?.inactiveDate,
        };

        if (claimant.clientPaymentHold) {
          this.clientPaymentHold = ClientPaymentHold.toModel(claimant.clientPaymentHold);
          this.addPaymentHoldToHeader();
        }

        this.logPageViewedEvent();
        this.refreshActionBar();
        this.loadClaimantDetailsIfNecessary();
      });
  }

  private addCallInfoListener(): void {
    this.store.select(callWidgetSelectors.callInfo)
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((info: CallInfo) => {
        this.callWidgetInfo = info;
      });
  }

  private addCommunicationListener(): void {
    this.communicationRecord$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((communication: CommunicationRecord | ProjectCommunicationRecord) => {
        this.communicationRecord = communication;
        const headers = [];

        if (communication) {
          headers.push({
            column: 'Communication Log ID',
            valueGetter: () => (communication.id ? communication.id : 'New Entry'),
          });

          if (communication.id && this.canViewAuditInfoPermission) {
            headers.push({
              column: 'Last Modified By',
              valueGetter: () => communication.lastModifiedBy?.displayName,
            });

            headers.push({
              column: 'Last Modified Date',
              valueGetter: () => this.dateFormatPipe.transform(communication.lastModifiedDate),
            });
          }
        }
        this.checkLogAndClaimant();
        this.store.dispatch(actions.UpdateHeader({ headerElements: headers }));
      });
  }

  private addHeaderListener(): void {
    this.headerElements$
      .pipe(
        filter((headerElements: ContextBarElement[]) => !!headerElements),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((elements: ContextBarElement[]) => {
        this.headerElements = elements;
        const isHold = elements?.some((header: ContextBarElement) => header?.column === this.holdStatusHeader?.column);
        if (this.holdStatusHeader && !isHold && !this.communicationRecord) {
          this.addPaymentHoldToHeader();
        }
      });
  }

  private addActionBarListener(): void {
    this.actionBar$
      .pipe(
        filter((actionBar: ActionHandlersMap) => !!actionBar),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((actionBar: ActionHandlersMap) => {
        this.actionBar = this.getActionBarContent(actionBar);
      });
  }

  private getActionBarContent(actionBar: ActionHandlersMap): any {
    if (actionBar?.back && Object.keys(actionBar).length === 1) {
      return { back: () => this.onBackClicked() };
    }
    return {
      ...actionBar,

      back: () => this.onBackClicked(),

      logCall: {
        callback: () => this.callCenterStore.dispatch(widgetActions.StartCall({
          callInfo: <CallInfo>{
            clientName: this.title,
            entityId: this.claimantId,
            entityType: EntityTypeEnum.Clients,
          },
        })),
        disabled: () => !!this.callWidgetInfo,
        permissions: [
          PermissionService.create(PermissionTypeEnum.ClientCommunications, PermissionActionTypeEnum.Create),
          PermissionService.create(PermissionTypeEnum.ClientCommunications, PermissionActionTypeEnum.LogCall),
        ],
      },
      holdPayments: {
        callback: () => this.holdPayments(),
        disabled: () => !!this.callWidgetInfo,
        hidden: () => !!this.clientPaymentHold,
        permissions: [
          PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.ClaimantPutOnHold),
        ],
      },
      updateHoldStatus: {
        callback: () => this.holdPayments(),
        disabled: () => !!this.callWidgetInfo,
        hidden: () => !this.clientPaymentHold,
        permissions: [
          PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.ClaimantPutOnHold),
        ],
      },

      ...this.getCommonBarActions(),
    };
  }

  private addPersonDetailsHeaderListener(): void {
    this.personDetailsHeader$
      .pipe(
        filter((person: Person) => person !== null),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((person: Person) => {
        this.title = person.fullName;
      });
  }

  private addHoldTypesListener(): void {
    this.holdTypes$
      .pipe(
        filter((x: HoldType[]) => !!x),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((holdTypes: HoldType[]) => {
        this.holdTypes = holdTypes;
      });
  }

  private addClientPaymentHoldListener(): void {
    this.clientPaymentHold$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((clientPaymentHold: ClientPaymentHold) => {
      this.clientPaymentHold = clientPaymentHold;

      if (clientPaymentHold) {
        this.addPaymentHoldToHeader();
      }
    });
  }

  private addActionsSubjListener(): void {
    this.actionsSubj
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        ofType(addressActions.sharedActions.addressesListActions.RefreshAddressesListComplete),
      )
      .subscribe(() => {
        this.store.dispatch(actions.GetClaimantIdSummaryRequest({ id: this.claimantId }));
      });

    this.actionsSubj
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        ofType(actions.RemoveClaimantFromHoldSuccess),
      )
      .subscribe(() => {
        this.clientPaymentHold = null;
        this.holdStatusHeader = null;

        const header = this.headerElements.filter(
          (headerEl: ContextBarElement) => headerEl.column && !this.holdTypes.some((holdType: HoldType) => holdType.name.toLowerCase() === headerEl.column.toLowerCase()),
        );

        this.store.dispatch(actions.UpdateHeader({ headerElements: header }));
      });
  }

  private addTabsCountListeners(): void {
    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        DeleteAddressSuccess,
        GetAddressesListComplete,
        GetAllPersonContactsSuccess,
        GetCommunicationListSuccess,
        GetNotesListComplete,
        GetDocumentsListComplete,
        actions.GetOrganizationAccessCompleted,
        GetClaimantIdentifiersSuccess,
        GetClaimantIdSummarySuccess,
      ),
    ).subscribe(() => this.store.dispatch(actions.GetClaimantTabsCount({ id: this.claimantId })));
  }

  private getCommonBarActions(): ActionHandlersMap {
    return {
      removePin: {
        callback: () => this.store.dispatch(pinnedPagesActions.RemovePinnedPage({
          entityId: this.claimantId,
          entityType: EntityTypeEnum.Clients,
          callback: () => { this.isPinned = false; },
        })),
        hidden: () => !this.isPinned,
      },
      pinPage: {
        callback: () => this.store.dispatch(pinnedPagesActions.CreatePinnedPage({
          view: <PinnedPage>{
            entityId: this.claimantId,
            entityTypeId: EntityTypeEnum.Clients,
            url: `/claimants/${this.claimantId}`,
          },
          callback: () => { this.isPinned = true; },
        })),
        hidden: () => this.isPinned,
      },

      viewInLPM: {
        callback: () => LPMHelper.viewInLPM('/#client-details', { clientId: this.claimantId }),
        permissions: PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.ViewInLPM),
      },
    };
  }

  private onBackClicked(): void {
    this.pager$.pipe(
      first(),
    ).subscribe((pager: Pager) => {
      if (!pager) {
        this.store.dispatch(GotoParentView());
        return;
      }

      if (pager.isForceDefaultBackNav) {
        this.store.dispatch(fromShared.UpdatePager({ pager: { isForceDefaultBackNav: false } }));
        this.store.dispatch(GotoParentView());
        return;
      }

      switch (pager.relatedPage) {
        case RelatedPage.PaymentsFromClaimantOverview:
        case RelatedPage.ReleaseSummaryFromClaimantOverview:
        case RelatedPage.LedgerSummaryFromClaimantOverview:
        case RelatedPage.ProbateSummaryFromClaimantOverview:
        case RelatedPage.BankruptcySummaryFromClaimantOverview:
        case RelatedPage.ServicesFromClaimantOverview:
        {
          const payload = <paymentActions.IEntityPaymentsPayload> pager.payload;
          this.store.dispatch(fromShared.ActivatePager({ relatedPage: RelatedPage.ClaimantsFromSearch }));
          if (payload?.entityId) {
            this.store.dispatch(claimantActions.GoToClaimantDetails({ id: payload.entityId, navSettings: null }));
          } else {
            this.store.dispatch(GotoParentView());
          }
          break;
        }
        case RelatedPage.GlobalCommunicationSearch:
          this.store.dispatch(GotoParentView());
          break;
        case RelatedPage.ClaimantsFromSearch:
          this.store.dispatch(GoToClaimantsListPage());
          break;
        case RelatedPage.ClaimantsCommunications:
          this.store.dispatch(fromShared.ActivatePager({ relatedPage: RelatedPage.ClaimantsFromSearch }));
          this.store.dispatch(actions.GotoCommunicationsList());
          break;
        case RelatedPage.ClaimantsFromProjectDashboard:
          this.store.dispatch(GotoParentView());
          break;
        case RelatedPage.ClaimantsFromClaimantSummary: {
          const payload = <actions.IClaimantSummaryPagerPayload> pager.payload;
          this.store.dispatch(fromShared.ActivatePager({ relatedPage: RelatedPage.ProjectsFromSearch }));
          this.store.dispatch(actions.GoToClaimantSummary({ projectId: payload.projectId }));
          break;
        }
        case RelatedPage.ClaimantsFromClaimantSummaryRollup: {
          const payload = <actions.IClaimantSummaryPagerPayload> pager.payload;
          this.store.dispatch(fromShared.ActivatePager({ relatedPage: RelatedPage.ProjectsFromSearch }));
          this.store.dispatch(actions.GoToClaimantSummaryRollup({ projectId: payload.projectId }));
          break;
        }
        case RelatedPage.PaymentItemsDetails: {
          const payload = <actions.IClaimantSummaryPagerPayload> pager.payload;
          this.store.dispatch(fromShared.ActivatePager({ relatedPage: RelatedPage.ProjectsFromSearch }));
          this.store.dispatch(actions.GoToPaymentItemDetails({ paymentId: payload.paymentId }));
          break;
        }
        case RelatedPage.TransferItemsDetails: {
          const payload = <actions.IClaimantSummaryPagerPayload> pager.payload;
          this.store.dispatch(fromShared.ActivatePager({ relatedPage: RelatedPage.ProjectsFromSearch }));
          this.store.dispatch(actions.GoToTransferItemDetails({ transferId: payload.paymentId }));
          break;
        }
        case RelatedPage.ClaimantsFromBankruptcyDashboard:
        case RelatedPage.ClaimantsFromLienResolutionDashboard:
        case RelatedPage.ClaimantsFromProbateDashboard:
        case RelatedPage.ClaimantsFromReleaseDashboard:
          this.store.dispatch(fromShared.ActivatePager({ relatedPage: RelatedPage.ProjectsFromSearch }));
          this.store.dispatch(GotoParentView());
          break;
        case RelatedPage.PaymentsFromClaimant:
        case RelatedPage.PaymentsFromProject: {
          const payload = <paymentActions.IEntityPaymentsPayload> pager.payload;
          this.store.dispatch(paymentActions.GoToPaymentsList({ payload }));
          this.store.dispatch(fromShared.ActivatePager({ relatedPage: payload.parentPage }));
          break;
        }
        case RelatedPage.LedgerSummary: {
          const payload = pager.payload as actions.ILedgerSummaryPagerPayload;
          this.store.dispatch(fromShared.ActivatePager({ relatedPage: payload.parentPage }));
          this.store.dispatch(GotoParentView());
          this.store.dispatch(actions.GetClaimantIdSummaryRequest({ id: this.claimantId }));
          break;
        }
        default:
          this.store.dispatch(GotoParentView());
          break;
      }
    });
  }

  onDetailsExpand(isExpanded: boolean): void {
    this.store.dispatch(actions.ToggleClaimantSummaryBar({ isExpanded }));
  }

  private logPageViewedEvent(): void {
    this.store.dispatch(recentViewActions.CreateRecentView({
      view: <RecentView>{
        entityId: this.claimantId,
        entityTypeId: EntityTypeEnum.Clients,
        url: `/claimants/${this.claimantId}`,
      },
    }));
  }

  private refreshActionBar(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: { ...this.actionBar } }));
  }

  private checkTab(): void {
    this.activeTab = this.router.url.split('/').pop();

    this.router.events
      .pipe(
        filter((event: NavigationEnd): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((event: NavigationEnd) => {
        this.isContextBarExpandable = !event.url.includes('communications/');
        this.activeTab = event.url.split('/').pop();
        this.loadClaimantDetailsIfNecessary();
      });
  }

  private getDetailsTabData(): void {
    this.store.dispatch(sharedActions.personGeneralInfoActions.GetPersonDetails({ id: this.personId }));
    this.addPersonDetailsHeaderListener();
  }

  private initNavigationStateData(): void {
    // AC-5352 - in case if case module is initialized, and claimant details module is not yet initialized,
    //           we need to pass claimant details request in navigation state and then restore it here.
    //           This relates to the lazy initialization of Angular modules.
    const navigationState = this.router.getCurrentNavigation();
    if (navigationState && navigationState.extras.state && navigationState.extras.state.claimantDetailsRequest) {
      this.store.dispatch(actions.SetClaimantDetailsRequest({ claimantDetailsRequest: navigationState.extras.state.claimantDetailsRequest }));
    }
  }

  public initClaimantDetailsSubscription(): void {
    this.claimantDetailsRequest$.pipe(filter((x: ClaimantDetailsRequest) => !!x), takeUntil(this.ngUnsubscribe$))
      .subscribe((result: ClaimantDetailsRequest) => { this.claimantDetailsRequest = result; });
    this.claimantSummary$.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((result: ClaimantSummary) => { this.claimantSummary = result; });
  }

  public toPage(pageNumber: number): void {
    let apiCall: paginatorActions.PaginatorApiCall;
    let params: PaginatorParams;
    let skipClaimantUpdate: boolean;
    const otherParams = [];

    this.store.dispatch(fromShared.UpdatePager({ pager: { currentPage: pageNumber } }));
    this.pager$.pipe(first()).subscribe((pager: Pager) => {
      switch (pager.relatedPage) {
        case RelatedPage.ClaimantsFromProject:
          apiCall = this.projectsService.getClients.bind(this.projectsService);
          otherParams.push(pager.payload.projectId);
          params = <PaginatorParams>{
            gridParams: { ...pager.payload, ...this.claimantDetailsRequest.gridParamsRequest },
            otherParams,
          };
          break;

        case RelatedPage.ClaimantsFromProjectDashboard:
          apiCall = this.projectsService.getProjectOverviewDashboardClaimants.bind(this.projectsService);
          params = <PaginatorParams>{
            gridParams: {
              ...pager.payload,
              ...this.claimantDetailsRequest.gridParamsRequest,
              caseId: this.claimantDetailsRequest.projectId,
              fieldId: this.claimantDetailsRequest.fieldId,
              filterParameter: this.claimantDetailsRequest.filterParameter,
              filterValue: this.claimantDetailsRequest.filterValue,
            },
          };
          break;

        case RelatedPage.ClaimantsCommunications:
        {
          skipClaimantUpdate = true;
          const payload = <IGetCommunicationListRequestParams> { ...pager.payload };
          const startRow = pager.currentPage > 0 ? pager.currentPage - 1 : 0;
          payload.agGridParams.request.startRow = startRow;
          payload.agGridParams.request.endRow = startRow + 1;
          this.store.dispatch(GetCommunicationListRequest({ payload }));
          break;
        }

        case RelatedPage.ProbateSearch:
          skipClaimantUpdate = true;
          apiCall = this.clientsService.search.bind(this.clientsService);
          params = <PaginatorParams>{ gridParams: { ...pager.payload, ...this.claimantDetailsRequest.gridParamsRequest } };
          this.store.dispatch(paginatorActions.PaginatorToObject({
            pageNumber,
            apiCall: this.probatesService.search.bind(this.probatesService),
            callback: (probate: ProbateDetails) => {
              this.loadClaimant(probate.clientId);
              this.store.dispatch(GoToProbateDetails({ clientId: probate.clientId }));
            },
            params,
          }));
          break;

        case RelatedPage.LedgerSummary: {
          skipClaimantUpdate = true;
          const payload = <actions.ILedgerSummaryPagerPayload>pager.payload;
          const ledger = payload.data[pageNumber - 1];
          if (ledger) {
            this.store.dispatch(actions.GotoLedgerDetails({ claimantId: this.claimantDetailsRequest.id, ledgerId: ledger.id }));
            this.loadClaimant(this.claimantDetailsRequest.id);
            this.store.dispatch(actions.GetLedgerInfo({
              clientId: this.claimantDetailsRequest.id,
              ledgerId: ledger.id,
            }));
          }
          break;
        }

        case RelatedPage.ClaimantsFromClaimantSummary:
          skipClaimantUpdate = true;
          params = <PaginatorParams>{
            gridParams: { ...pager.payload, ...this.claimantDetailsRequest.gridParamsRequest },
            otherParams: [pager.payload.projectId],
          };
          this.store.dispatch(paginatorActions.PaginatorToObject({
            pageNumber,
            apiCall: this.claimantsSummaryService.getClaimantsSummary.bind(this.claimantsSummaryService),
            callback: (summary: DisbursementClaimantSummary) => {
              this.loadClaimant(summary.clientId);
              this.store.dispatch(actions.GoToClaimantLedgerSummary({ claimantId: summary.clientId }));
            },
            params,
          }));
          break;

        case RelatedPage.ClaimantsFromReleaseDashboard:
        case RelatedPage.ClaimantsFromLienResolutionDashboard:
        case RelatedPage.ClaimantsFromBankruptcyDashboard:
        case RelatedPage.ClaimantsFromProbateDashboard:

          switch (pager.relatedPage) {
            case RelatedPage.ClaimantsFromReleaseDashboard:
              apiCall = this.projectsService.getClientsByRelease.bind(this.projectsService);
              break;
            case RelatedPage.ClaimantsFromLienResolutionDashboard:
              apiCall = this.projectsService.getClientsByLienResolution.bind(this.projectsService);
              break;
            case RelatedPage.ClaimantsFromBankruptcyDashboard:
              apiCall = this.projectsService.getClientsByBankruptcy.bind(this.projectsService);
              break;
            case RelatedPage.ClaimantsFromProbateDashboard:
              apiCall = this.projectsService.getClientsByProbate.bind(this.projectsService);
              break;
          }

          otherParams.push(this.claimantDetailsRequest.projectId);
          otherParams.push(this.claimantDetailsRequest.rootProductCategoryId);
          otherParams.push(this.claimantDetailsRequest.lienType);
          otherParams.push(this.claimantDetailsRequest.lienPhases);
          otherParams.push(this.claimantDetailsRequest.clientStages);

          params = <PaginatorParams>{
            gridParams: {
              ...this.claimantDetailsRequest.gridParamsRequest,
              startRow: pager.currentPage,
              endRow: pager.currentPage + 1,
            },
            otherParams,
          };
          break;

        case RelatedPage.PaymentsFromClaimant: {
          skipClaimantUpdate = true;
          const payload = <paymentActions.IEntityPaymentsPayload> { ...pager.payload };
          otherParams.push(payload.entityId);
          otherParams.push(payload.entityType);
          params = <PaginatorParams>{
            gridParams: payload.agGridParams.request,
            otherParams,
          };
          this.store.dispatch(paginatorActions.Paginator({
            pageNumber,
            prevId: UrlHelper.getId(this.router.url),
            apiCall: this.paymentsService.searchEntityPayments.bind(this.paymentsService),
            callback: (paymentId: number) => {
              this.store.dispatch(paymentActions.GetPaymentDetails({ paymentId }));
            },
            params,
          }));
          break;
        }

        case RelatedPage.GlobalCommunicationSearch: {
          skipClaimantUpdate = true;
          apiCall = this.communicationService.search.bind(this.communicationService);
          params = <PaginatorParams>{ gridParams: this.claimantDetailsRequest.gridParamsRequest };

          this.store.dispatch(paginatorActions.PaginatorToObject({
            pageNumber,
            params,
            apiCall,
            callback: (data: any) => {
              const comm: CommunicationRecord = CommunicationRecord.toModel(data);
              if (comm.entityTypeId === EntityTypeEnum.Clients) {
                this.store.dispatch(GetCommunicationDetailsLoadingStarted({
                  additionalActionNames: [
                    actions.GetClaimantRequest.type,
                  ],
                }));
                this.loadClaimant(comm.claimantId);
                this.store.dispatch(GetCommunicationRecordRequest({ communicationRecordId: comm.id }));
              }

              this.store.dispatch(GoToCommunication({ entityId: comm.claimantId ?? comm.caseId, entityTypeId: comm.entityTypeId, id: comm.id, canReadNotes: this.permissionService.canRead(PermissionTypeEnum.CommunicationNotes) }));
            },
          }));
          break;
        }

        default:
          apiCall = this.clientsService.search.bind(this.clientsService);
          params = <PaginatorParams>{
            gridParams: this.claimantDetailsRequest.gridParamsRequest,
            otherParams: this.claimantDetailsRequest.projectId ? [this.claimantDetailsRequest.projectId] : null,
          };
          break;
      }
    });

    if (skipClaimantUpdate) {
      return;
    }

    this.startClaimantLoading();

    const claimantDetailsRequest: ClaimantDetailsRequest = {
      ...this.claimantDetailsRequest,
      gridParamsRequest: params.gridParams,
    };
    this.store.dispatch(actions.SetClaimantDetailsRequest({ claimantDetailsRequest }));

    this.store.dispatch(fromShared.UpdatePager({ pager: { currentPage: pageNumber } }));
    this.store.dispatch(paginatorActions.Paginator({
      pageNumber,
      prevId: this.route.snapshot.params.id,
      apiCall,
      callback: this.paginatorCallBack.bind(this),
      params,
    }));
  }

  private paginatorCallBack(id: number): void {
    const urlArray: string[] = UrlHelper.getUrlArrayForPager(this.claimantId, id, this.router.url);
    this.router.navigate(urlArray);
    this.loadClaimant(id);
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    this.store.dispatch(actions.SetProjectMessagesModalStatus({ isOpen: false }));
    this.modalService.hide();
  }

  private loadClaimantDetailsIfNecessary(): void {
    const idFromRoute = this.route.snapshot.params.id;
    if (!this.claimantSummary) {
      this.store.dispatch(actions.GetClaimantIdSummaryRequest({ id: idFromRoute }));
      this.store.dispatch(actions.GetClaimantServices({ clientId: idFromRoute }));
    }
    if (this.shouldLoadClaimantDetails()) {
      this.getDetailsTabData();
    }
  }

  private shouldLoadClaimantDetails(): boolean {
    return this.activeTab === this.tabs.details || this.activeTab === this.tabs.contacts;
  }

  private startClaimantLoading(): void {
    const additionalActionNames = [];
    if (this.shouldLoadClaimantDetails()) {
      additionalActionNames.push(sharedActions.personGeneralInfoActions.GetPersonDetails.type);
    }
    this.store.dispatch(actions.GetClaimantLoadingStarted({ additionalActionNames }));
  }

  private loadClaimant(id: number): void {
    this.store.dispatch(actions.GetClaimantCounts({ clientId: id }));
    this.store.dispatch(actions.GetClaimantRequest({ id }));
    this.store.dispatch(actions.GetClaimantIdSummaryRequest({ id }));
  }

  private holdPayments(): void {
    this.modalService.show(HoldPaymentsModalComponent, {
      class: 'hold-payments-modal',
      initialState: { clientId: this.claimantId, clientPaymentHold: this.clientPaymentHold },
    });
  }

  private addPaymentHoldToHeader(): void {
    if (!this.clientPaymentHold || !this.holdTypes) {
      return;
    }

    const claimantHoldType = this.holdTypes.find((holdType: HoldType) => holdType.id === this.clientPaymentHold.holdTypeId);
    const holdTypeReason = claimantHoldType.holdTypeReasons.find((t: IdValue) => t.id === this.clientPaymentHold.holdTypeReasonId).name;
    const headers = this.headerElements.filter((headerEl: ContextBarElement) => headerEl.column && headerEl.column.toLowerCase() !== claimantHoldType.name.toLowerCase());

    this.holdStatusHeader = {
      column: claimantHoldType.name.toUpperCase(),
      valueGetter: () => holdTypeReason,
    };
    this.store.dispatch(actions.UpdateHeader({
      headerElements: [
        ...headers, this.holdStatusHeader],
    }));
  }

  public onOpenClaimantMessagingModal(): void {
    this.claimantMessagingModal = this.modalService.show(ClaimantMessagingModalComponent, {
      initialState: { clientId: this.claimantId },
      class: 'claimant-messaging-modal',
      backdrop: false,
      keyboard: true,
      show: true,
      ignoreBackdropClick: true,
    });
  }

  private checkLogAndClaimant(): void {
    const currentClaimantid = Number(this.route.snapshot.params.id);
    if (this.communicationRecord?.id && this.communicationRecord.claimantId !== currentClaimantid) {
      this.toaster.showError('Wrong Claimant Log Communication Id');
      this.router.navigate([`/claimants/${currentClaimantid}/overview/tabs/communications`]);
    }
  }
}
