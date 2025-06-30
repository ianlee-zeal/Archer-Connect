import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionsSubject, Store } from '@ngrx/store';
import { takeUntil, filter, first } from 'rxjs/operators';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { commonSelectors } from '@shared/state/common.selectors';
import { AppState } from '@app/state/index';

import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as fromShared from '@shared/state/common.actions';
import { Pager, RelatedPage } from '@app/modules/shared/grid-pager';
import { PaginatorParams } from '@app/models/paginator-params';
import { PaymentsSearchService, PermissionService, ToastService } from '@app/services';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { NavigationSettings } from '@shared/action-bar/navigation-settings';

import * as paginatorActions from '@shared/grid-pager/state/actions';
import * as rootSelectors from '@app/state';
import { GotoParentView } from '@shared/state/common.actions';
import * as disbursementsSelectors from '@app/modules/disbursements/state/selectors';
import { TabItem } from '@app/models';
import { PaymentVoidService } from '@app/services/payment/payment-void.service';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { AbstractPaymentPage } from '../base/payment-page-base';

@Component({
  selector: 'app-payment-details-page',
  templateUrl: './payment-details-page.component.html',
  styleUrls: ['./payment-details-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PaymentDetailsPageComponent extends AbstractPaymentPage {
  public actionBar: ActionHandlersMap;
  public headerElements: ContextBarElement[];
  public gridParams: IServerSideGetRowsParamsExtended;
  public navigationSettings: NavigationSettings;
  public pager: Pager;

  public readonly checkVerificationCount$ = this.store.select(selectors.checkVerificationCount);

  private readonly tabsUrl = './tabs';
  public readonly tabs: TabItem[] = [
    {
      title: 'Payment Details',
      link: `${this.tabsUrl}/details`,
      permission: PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read),
    },

    {
      title: 'Check Verification',
      link: `${this.tabsUrl}/check-verification`,
      count: this.checkVerificationCount$,
      permission: PermissionService.create(PermissionTypeEnum.CheckVerification, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Payment Item Details',
      link: `${this.tabsUrl}/payment-item-details`,
      permission: PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read),
    },
  ];

  public readonly pager$ = this.store.select(commonSelectors.pager);

  public readonly gridParams$ = this.store.select(selectors.params);
  public readonly stopPaymentRequestGridParams$ = this.store.select(disbursementsSelectors.stopPaymentRequestGridParams);
  public loadingInProgress$ = this.store.select(rootSelectors.loadingInProgress);

  constructor(
    protected readonly store: Store<AppState>,
    private readonly paymentsService: PaymentsSearchService,
    private readonly route: ActivatedRoute,
    protected readonly toaster: ToastService,
    protected readonly paymentVoidService: PaymentVoidService,
    protected readonly actionsSubj: ActionsSubject,
  ) {
    super(store, paymentVoidService, actionsSubj, toaster);
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.startPaymentDetailsLoading();
    this.route.params
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(params => {
        this.paymentId = params.id;
        if (params.id) {
          this.store.dispatch(actions.GetPaymentDetails({ paymentId: params.id }));
        }
      });

    this.actionBar = {
      back: () => this.onBack(),
      ...this.requiredActionBar,
    };

    this.store.select(selectors.item).pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(payment => {
      this.headerElements = [
        { column: 'Payment Source', valueGetter: () => (payment.dataSource ? payment.dataSource.name : '') },
      ];
    });

    this.pager$.pipe(
      first(),
    ).subscribe((pager: Pager) => {
      this.pager = pager;

      switch (pager?.relatedPage) {
        case RelatedPage.StopPaymentRequestList:
          this.stopPaymentRequestGridParams$
            .pipe(
              filter(p => p !== null),
              takeUntil(this.ngUnsubscribe$),
            ).subscribe(params => {
              this.gridParams = params;
            });
          break;

        default:
          this.gridParams$
            .pipe(
              filter(p => p !== null),
              takeUntil(this.ngUnsubscribe$),
            ).subscribe(params => {
              this.gridParams = params;
            });
          break;
      }
    });
  }

  private onBack(): void {
    if (!this.pager) {
      this.store.dispatch(GotoParentView());
      return;
    }

    switch (this.pager.relatedPage) {
      case RelatedPage.StopPaymentRequestList: {
        this.store.dispatch(actions.GoToStopPaymentRequestList());
        break;
      }
      default:
        this.store.dispatch(actions.GoToPaymentsList({ payload: { entityType: EntityTypeEnum.None, entityId: null } }));
        break;
    }
  }

  private paginatorCallBack(id: number) {
    this.paymentId = id;
    this.store.dispatch(actions.GetPaymentDetails({ paymentId: this.paymentId }));
  }

  public toPage(pageNumber: number): void {
    this.startPaymentDetailsLoading();
    const relatedPage = this.pager.relatedPage === RelatedPage.StopPaymentRequestList ? RelatedPage.StopPaymentRequestList : RelatedPage.PaymentsFromSearch;
    this.store.dispatch(fromShared.UpdatePager({ relatedPage, pager: { currentPage: pageNumber } }));
    this.store.dispatch(paginatorActions.Paginator({
      pageNumber,
      prevId: this.route.snapshot.params.id,
      apiCall: this.paymentsService.search.bind(this.paymentsService),
      callback: this.paginatorCallBack.bind(this),
      params: <PaginatorParams>{ gridParams: this.gridParams.request },
    }));
  }

  private startPaymentDetailsLoading() {
    this.store.dispatch(actions.GetPaymentDetailsLoadingStarted({ additionalActionNames: [] }));
  }
}
