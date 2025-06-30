import { ClaimantOverviewProbate } from "./claimant-overview-probate";
import { ClaimantOverviewBankruptcy } from "./claimant-overview-bankruptcy";
import { QSFAdmin } from "./claimant-overview-qsf-admin";
import { ClaimantOverviewLienData } from "./claimant-overview-lien-data";
import { ClaimantOverviewReleaseAdmin } from "./claimant-overview-release-admin";
import { ClaimantOverviewInvoicingDetails } from "./claimant-overview-invoicing-details";
import { ClaimantOverviewPaymentItem } from "./claimant-overview-payment-item";

export class ClaimantOverview {
  id: number;
  releaseAdmin: ClaimantOverviewReleaseAdmin;
  lienData: ClaimantOverviewLienData;
  probateItems: ClaimantOverviewProbate[];
  bankruptcyItems: ClaimantOverviewBankruptcy[];
  paymentItems: ClaimantOverviewPaymentItem[];
  qsfAdmin: QSFAdmin;
  invoicingDetails: ClaimantOverviewInvoicingDetails;
  engagedServicesIds: number[];

  public static toModel(item: any): ClaimantOverview {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      releaseAdmin: ClaimantOverviewReleaseAdmin.toModel(item.releaseAdmin),
      lienData: ClaimantOverviewLienData.toModel(item.lienData),
      probateItems: !item.probateItems ? [] : item.probateItems.filter(p => ClaimantOverviewProbate.toModel(p)),
      bankruptcyItems: !item.bankruptcyItems ? [] : item.bankruptcyItems.filter(p => ClaimantOverviewBankruptcy.toModel(p)),
      paymentItems: !item.paymentItems ? [] : item.paymentItems.filter(p => ClaimantOverviewPaymentItem.toModel(p)),
      qsfAdmin: QSFAdmin.toModel(item.qsfAdmin),
      invoicingDetails: ClaimantOverviewInvoicingDetails.toModel(item.invoicingDetails),
      engagedServicesIds: item.engagedServicesIds,
    };
  }
}
