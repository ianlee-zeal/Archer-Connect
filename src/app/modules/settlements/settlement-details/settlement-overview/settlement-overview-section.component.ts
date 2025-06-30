import { Component, OnDestroy, OnInit } from '@angular/core';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { TabItem } from '@app/models';
import { Store } from '@ngrx/store';
import { sharedSelectors } from '@app/modules/shared/state';
import * as fromSettlements from '../../state';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-settlement-overview-section',
  templateUrl: './settlement-overview-section.component.html',
})
export class SettlementOverviewSectionComponent implements OnInit, OnDestroy {
  private readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Details',
      link: `${this.tabsUrl}/details`,
      permission: PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.Read),
    },
    { title: 'Notes',
      link: `${this.tabsUrl}/notes`,
      permission: PermissionService.create(PermissionTypeEnum.SettlementNotes, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Documents',
      link: `${this.tabsUrl}/documents`,
      permission: PermissionService.create(PermissionTypeEnum.SettlementDocuments, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Related Projects',
      link: `${this.tabsUrl}/projects`,
      permission: PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.RelatedProjects),
    },
    {
      title: 'Related Claimants',
      link: `${this.tabsUrl}/claimants`,
      permission: PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.RelatedClaimants),
    },
    {
      title: 'Financial Summary',
      link: `${this.tabsUrl}/financial-summary`,
      inactive: true,
      permission: PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.FinancialSummary),
    },
  ];

  public showFinancialSummary$ = this.store.select(sharedSelectors.settlementInfoSelectors.showFinancialSummary);
  public ngDestroyed$ = new Subject<void>();

  constructor(
    public store: Store<fromSettlements.SettlementState>,
  ) {
  }

  ngOnInit(): void {
    this.showFinancialSummary$
      .pipe(
        takeUntil(this.ngDestroyed$),
      )
      .subscribe((showFinancialSummary: boolean) => {
        const financialSummaryTab = this.tabs.find((t: TabItem) => t.title === 'Financial Summary');
        financialSummaryTab.inactive = !showFinancialSummary;
      });
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
