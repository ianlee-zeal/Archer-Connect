import { Injectable } from '@angular/core';
import { EntityTypeEnum } from '@app/models/enums';

@Injectable({
  providedIn: 'root'
})
export class SavedSearchUrlService {

  public getSavedSearchUrl(entityType: EntityTypeEnum, searchId: number, projectId?: number): string {
    switch (entityType) {
      case EntityTypeEnum.Clients:
        if (!projectId) {
          return `/claimants/saved-search/${searchId}`;
        }
        return `/projects/${projectId}/claimants/tabs/overview/saved-search/${searchId}`;
      case EntityTypeEnum.Probates:
        return `/probates/saved-search/${searchId}`;
      case EntityTypeEnum.PaymentQueues:
        if (projectId) {
          return `/projects/${projectId}/payments/tabs/payment-queue/saved-search/${searchId}`;
        }
        break;
      case EntityTypeEnum.ProjectClaimantSummary:
        if (projectId) {
          return `/projects/${projectId}/payments/tabs/claimant-summary/saved-search/${searchId}`;
        }
        break;
      case EntityTypeEnum.ProjectClaimantSummaryRollup:
        if (projectId) {
          return `/projects/${projectId}/payments/tabs/claimant-summary-rollup/saved-search/${searchId}`;
        }
        break;
      default:
        return null;
    }
    return null;
  }

}
