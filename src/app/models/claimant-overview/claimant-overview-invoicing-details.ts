import { ClaimantOverviewInvoicingDetailsItem } from "./claimant-overview-invoicing-details-item";

export class ClaimantOverviewInvoicingDetails{
  lienFeeCap: number;
  items: ClaimantOverviewInvoicingDetailsItem[];

  public static toModel(item: any): ClaimantOverviewInvoicingDetails {
    if (!item) {
      return null;
    }

    return {
      lienFeeCap: item.lienFeeCap,
      items: item.items.map(ClaimantOverviewInvoicingDetailsItem.toModel),
    };
  }
}
