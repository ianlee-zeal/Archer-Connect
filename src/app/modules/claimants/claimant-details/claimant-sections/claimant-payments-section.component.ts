import { Component, OnDestroy, OnInit } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { EntityPaymentsSectionBase } from '@app/modules/payments/base/entity-payments-section-base';
import { PermissionService } from '@app/services';
import { Store } from '@ngrx/store';
import { ClaimantDetailsState } from '../state/reducer';
import * as actions from '../state/actions';
import { ClaimantSectionBase } from './claimant-section-base.component';

@Component({
  selector: 'app-claimant-payments-section',
  templateUrl: './claimant-section.component.html',
  styleUrls: ['./claimant-section.component.scss'],
})
export class ClaimantPaymentsSectionComponent extends EntityPaymentsSectionBase implements OnInit, OnDestroy, ClaimantSectionBase {
  isClaimantInfoExpanded: boolean = true;
  isExpandable: boolean = false;
  public readonly tabs: TabItem[] = [
    {
      title: 'Ledger Summary',
      link: `${this.tabsUrl}/ledger-summary`,
      permission: PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Ledger Overview',
      link: `${this.tabsUrl}/ledger-overview`,
      permission: PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Election Form',
      link: `${this.tabsUrl}/election-form`,
      permission: PermissionService.create(PermissionTypeEnum.ElectionForms, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Disbursement Groups',
      link: `${this.tabsUrl}/groups`,
      permission: PermissionService.create(PermissionTypeEnum.ClaimantDisbursementGroups, PermissionActionTypeEnum.Read),
    },
    this.paymentsTab,
    {
      title: 'Deficiencies',
      link: `${this.tabsUrl}/deficiencies`,
      permission: PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.Read),
    },
  ];

  constructor(
    private store: Store<ClaimantDetailsState>,
  ) { super(); }

  ngOnInit(): void {
    this.store.dispatch(actions.ToggleSpecialDesignationsBar({ showSpecialDesignationsBar: false }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
    this.store.dispatch(actions.ToggleSpecialDesignationsBar({ showSpecialDesignationsBar: true }));
  }
}
