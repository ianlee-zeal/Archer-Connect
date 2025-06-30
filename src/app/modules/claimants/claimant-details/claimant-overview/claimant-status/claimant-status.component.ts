import { Component, Input } from '@angular/core';
import { Claimant } from '@app/models/claimant';
import { ClaimantOverviewBankruptcy } from '@app/models/claimant-overview/claimant-overview-bankruptcy';
import { ClaimantOverviewLienData } from '@app/models/claimant-overview/claimant-overview-lien-data';
import { ClaimantOverviewProbate } from '@app/models/claimant-overview/claimant-overview-probate';
import { QSFAdmin } from '@app/models/claimant-overview/claimant-overview-qsf-admin';
import { ClaimantOverviewReleaseAdmin } from '@app/models/claimant-overview/claimant-overview-release-admin';
import { ClaimantOverviewReleaseAdminItem } from '@app/models/claimant-overview/claimant-overview-release-admin-item';
import {
  LienServiceStatus,
  PermissionActionTypeEnum,
  PermissionTypeEnum,
  ProductCategory
} from '@app/models/enums';
import { ReleasePhase } from '@app/models/enums/release-phase.enum';
import { ProbatePhase } from '@app/models/enums/probate-phase.enum';
import { Policy } from '@app/modules/auth/policy';
import { PermissionService } from '@app/services';
import { combineLatest, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-claimant-status',
  templateUrl: './claimant-status.component.html',
  styleUrls: ['./claimant-status.component.scss'],
})
export class ClaimantStatusComponent {
  private unsubscribe$ = new Subject<void>();
  public ProductCategory = ProductCategory;

  @Input('releaseAdmin') public releaseAdmin$: Observable<ClaimantOverviewReleaseAdmin>;
  @Input('releaseAdminItems') public releaseAdminItems$: Observable<ClaimantOverviewReleaseAdminItem[]>;
  @Input('probates') public probates$: Observable<ClaimantOverviewProbate[]>;
  @Input('claimant') public claimant$: Observable<Claimant>;
  @Input('lienData') public lienData$: Observable<ClaimantOverviewLienData>;
  @Input('bankruptcies') public bankruptcies$: Observable<ClaimantOverviewBankruptcy[]>;
  @Input('qsfData') public qsfData$: Observable<QSFAdmin>;
  @Input('engagedServicesIds') public engagedServicesIds$: Observable<number[]>;
  @Input() public showTitle: boolean = true;

  claimant: Claimant;
  probate: ClaimantOverviewProbate;
  releaseAdmin: ClaimantOverviewReleaseAdmin;
  releaseAdminItem: ClaimantOverviewReleaseAdminItem;
  lienData: ClaimantOverviewLienData;
  bankruptcy: ClaimantOverviewBankruptcy;
  qsfData: QSFAdmin;
  engagedServicesIds: number[];

  constructor(private readonly permissionService: PermissionService) {}

  ngOnInit(): void {
    this.initializeData();
  }

  private initializeData(): void {
    combineLatest([
      this.claimant$,
      this.probates$,
      this.releaseAdmin$,
      this.releaseAdminItems$,
      this.lienData$,
      this.bankruptcies$,
      this.qsfData$,
      this.engagedServicesIds$,
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([claimant, probates, releaseAdmin, releaseAdminItems, lienData, bankruptcies, qsfData, engagedServicesIds]:
      [Claimant, ClaimantOverviewProbate[], ClaimantOverviewReleaseAdmin, ClaimantOverviewReleaseAdminItem[], ClaimantOverviewLienData, ClaimantOverviewBankruptcy[], QSFAdmin, number[]]) => {
        this.claimant = claimant;
        this.probate = probates?.[0] || null;
        this.releaseAdmin = releaseAdmin;
        this.releaseAdminItem = releaseAdminItems?.[0] || null;
        this.lienData = lienData;
        this.bankruptcy = bankruptcies?.[0] || null;
        this.qsfData = qsfData;
        this.engagedServicesIds = engagedServicesIds;
      });
  }

  getLink(productCategory: ProductCategory): string {
    const baseLink = `claimants/${this.claimant?.id}/services/`;

    if (productCategory === ProductCategory.QSFAdministration) {
      if (this.permissionService.has(PermissionService.create(PermissionTypeEnum.Disbursements, PermissionActionTypeEnum.Read))) {
        return `claimants/${this.claimant?.id}/payments`;
      }
      return '';
    }

    if (this.permissionService.has(PermissionService.create(Policy.getLienServices(productCategory), PermissionActionTypeEnum.Read))) {
      return `${baseLink}${productCategory}`;
    }

    return '';
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isServiceEngaged(serviceId: ProductCategory): boolean {
    return this.engagedServicesIds?.includes(serviceId);
  }

  getServiceStatus(serviceId: ProductCategory): number {
    const getServiceStatusId = (data, phaseId?): number => {
      if (!this.isServiceEngaged(serviceId)) return LienServiceStatus.NotEngaged;

      if(phaseId && this.isPhaseInactive(serviceId, phaseId)) {
        return LienServiceStatus.Inactive;
      }
      return data?.service?.status?.id || LienServiceStatus.NotEngaged;
    };

    switch (serviceId) {
      case ProductCategory.MedicalLiens:
        return getServiceStatusId(this.lienData);
      case ProductCategory.Probate:
        return getServiceStatusId(this.probate, this.probate?.phaseId);
      case ProductCategory.Release:
        return getServiceStatusId(this.releaseAdmin, this.releaseAdminItem?.phaseId);
      case ProductCategory.Bankruptcy:
        return getServiceStatusId(this.bankruptcy);
      case ProductCategory.QSFAdministration:
        return getServiceStatusId(this.qsfData);
      default:
        return LienServiceStatus.NotEngaged;
    }
  }

  getBottomText(serviceId: ProductCategory): string {
    const getStatusText = (data: any): string => {
      if (!data && this.isServiceEngaged(serviceId)) {
        return '';
      }
      return this.getServiceStatus(serviceId) === LienServiceStatus.NotEngaged ? 'Not Engaged' : data?.name ?? '';
    };

    switch (serviceId) {
      case ProductCategory.MedicalLiens:
        return getStatusText(this.lienData?.service?.status);
      case ProductCategory.Probate:
        return getStatusText(this.probate?.stage);
      case ProductCategory.Release:
        return getStatusText(this.releaseAdminItem?.stage);
      case ProductCategory.Bankruptcy:
        return getStatusText(this.bankruptcy?.stage);
      case ProductCategory.QSFAdministration:
        return getStatusText(this.qsfData?.service?.status);
      default:
        return '';
    }
  }

  getPercentComplete(data: any): number {
    return data?.percentComplete ?? 0;
  }

  isPhaseInactive(serviceId: ProductCategory, phaseId: number): boolean {
    const inactivePhases = {
      [ProductCategory.Release]: [ReleasePhase.Removed],
      [ProductCategory.Probate]: [ProbatePhase.ClosedWithdrawn, ProbatePhase.NotMapped],
    };
    return inactivePhases[serviceId]?.includes(phaseId);
  }
}
