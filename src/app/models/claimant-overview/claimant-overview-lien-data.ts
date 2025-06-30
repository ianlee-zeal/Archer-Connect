import { LienService } from "../lien-service";
import { ClaimantOverviewLienItem } from "./claimant-overview-lien-item";

export class ClaimantOverviewLienData {
  service: LienService;
  holdback?: number;
  totalLiens?: number;
  initialTotalAmount?: number;
  liensResolved?: number;
  items: ClaimantOverviewLienItem[];
  percentComplete?: number;

  public static toModel(item: any): ClaimantOverviewLienData {
    if (!item) {
      return null;
    }

    return {
      service: LienService.toModel(item.service),
      holdback: item.holdback,
      totalLiens: item.totalLiens,
      initialTotalAmount: item.initialTotalAmount,
      liensResolved: item.liensResolved,
      items: item.items.map(ClaimantOverviewLienItem.toModel),
      percentComplete: item.percentComplete,
    };
  }
}
