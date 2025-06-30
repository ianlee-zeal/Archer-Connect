import { Component, OnDestroy, OnInit, Output, ViewEncapsulation, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { ClaimantSummary } from '@app/models/claimant-summary';
import { LienServiceStatus, PermissionTypeEnum } from '@app/models/enums';
import { Policy } from '@app/modules/auth/policy';
import * as selectors from '../state/selectors';
import { ClaimantDetailsState } from '../state/reducer';
import { PermissionService } from '../../../../services/permissions.service';
import { KeyValue } from '@app/models'

@Component({
  selector: 'app-summary-bar',
  templateUrl: './summary-bar.component.html',
  styleUrls: ['./summary-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SummaryBarComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe$ = new Subject<void>();

  readonly claimantSummary$ = this.store.select(selectors.claimantSummary);
  readonly isExpanded$ = this.store.select(selectors.isExpanded);
  readonly projects$ = this.store.select(selectors.projects);
  private readonly services$ = this.store.select(selectors.services);

  public claimantSummary: ClaimantSummary;
  public projectId: number;

  @Output()
  readonly expand = new EventEmitter<boolean>();

  get canReadOrganizations(): boolean {
    return this.permissionService.canRead(PermissionTypeEnum.Organizations);
  }

  getOrganizationName(orgId: number, orgName: string): string {
    if (!orgName || !orgId) return '-';
    return `${orgName} (${orgId})`;
  }

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
    private readonly permissionService: PermissionService,
  ) {}

  ngOnInit() : void {
    combineLatest([this.projects$, this.claimantSummary$, this.services$])
      .pipe(
        filter(([projects, summary, services]) => !!projects && !!summary && !!services),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(([projects, summary, services]) => {
        this.claimantSummary = summary;
          const servicesItems = services.filter(s => !!Policy.getLienServices(s.id)).map(service => {
            return {
              name: service.name,
              status: this.getServiceStatus(service.status.id),
            };
          });
        this.claimantSummary.services = servicesItems;
        this.projectId = projects?.find(personProject => personProject.projectName === summary?.projectName)?.projectId;
      });
  }

  public get totalAllocationTooltip(): KeyValue[] {
    return this.claimantSummary != null
      && !!this.claimantSummary?.totalAllocationInfo
      && this.claimantSummary?.totalAllocationInfo.length != 0
      ? this.claimantSummary?.totalAllocationInfo
      : [];
  }

  private getServiceStatus(status: LienServiceStatus): string {
    if (status === LienServiceStatus.NotEngaged) {
      return 'N/A';
    }
    return LienServiceStatus[status];
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
