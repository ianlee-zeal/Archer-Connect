import { Component } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { EntityPaymentsSectionBase } from '@app/modules/payments/base';
import { PermissionService } from '@app/services';
import * as fromProjects from '../state';
import * as selectors from '../state/selectors';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-project-payments-section',
  templateUrl: './project-section.component.html',
})
export class ProjectPaymentsSectionComponent extends EntityPaymentsSectionBase {
  public readonly canAccessTab$ = this.store.select(selectors.hasAccessToPrimaryOrgFeatures);
  private readonly ngUnsubscribe$ = new Subject<void>();

  public readonly tabs: TabItem[] = [
    {
      title: 'Dashboard',
      link: `${this.tabsUrl}/dashboard`,
      permission: PermissionService.create(PermissionTypeEnum.Disbursements, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Disbursement Groups',
      link: `${this.tabsUrl}/groups`,
      permission: PermissionService.create(PermissionTypeEnum.DisbursementGroups, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Claimant Summary',
      link: `${this.tabsUrl}/claimant-summary`,
      permission: PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Claimant Summary Rollup',
      link: `${this.tabsUrl}/claimant-summary-rollup`,
      permission: PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.Read),
    },
    {
      title: 'QSF Sweep',
      link: `${this.tabsUrl}/qsf-sweep`,
      permission: PermissionService.create(PermissionTypeEnum.ProjectQSFSweep, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Closing Statements',
      link: `${this.tabsUrl}/closing-statements`,
      permission: PermissionService.create(PermissionTypeEnum.ProjectsClosingStatement, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Election Forms',
      link: `${this.tabsUrl}/election-forms`,
      permission: PermissionService.create(PermissionTypeEnum.ElectionForms, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Payment Queue',
      permission: PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.Read),
      link: `${this.tabsUrl}/payment-queue`,
    },
    {
      title: 'Org Payment Status',
      permission: PermissionService.create(PermissionTypeEnum.ProjectOrgPaymentStatus, PermissionActionTypeEnum.Read),
      link: `${this.tabsUrl}/org-payment-status`,
    },
    {
      title: 'Payment Requests',
      link: `${this.tabsUrl}/payment-requests`,
      permission: PermissionService.create(PermissionTypeEnum.ManualPaymentRequest, PermissionActionTypeEnum.Read),
    },
    this.paymentsTab,
    {
      title: 'Notes',
      link: `${this.tabsUrl}/notes`,
      permission: PermissionService.create(PermissionTypeEnum.ProjectDisbursementNotes, PermissionActionTypeEnum.Read),
    },
  ];

  constructor(
    private readonly store: Store<fromProjects.AppState>,
  ){
    super();
  }

  ngOnInit(): void {
    this.canAccessTab$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(isPrimaryOrg => {
      const targetTitles = ['Payment Requests', 'Payment History'];
      this.tabs
        .filter(tab => tab != null && targetTitles.includes(tab.title))
        .forEach(tab => {
          tab.active = isPrimaryOrg;
        });
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}