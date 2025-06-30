import { LienService } from "../lien-service";
import { ClaimantOverviewReleaseAdminItem } from "./claimant-overview-release-admin-item";

export class ClaimantOverviewReleaseAdmin{
  service: LienService;
  items: ClaimantOverviewReleaseAdminItem[];

  public static toModel(item: any): ClaimantOverviewReleaseAdmin {
    if (!item) {
      return null;
    }

    return {
      service: LienService.toModel(item.service),
      items: item.items.map(ClaimantOverviewReleaseAdminItem.toModel),
    };
  }
}
