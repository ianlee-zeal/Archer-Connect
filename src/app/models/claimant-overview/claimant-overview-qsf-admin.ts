import { LienService } from "../lien-service";
import { QSFAdminItem } from "./claimant-overview-qsf-admin-item";
import { PaymentStatusAmount } from "./payment-status-amount";

export class QSFAdmin {
  qsfStatus: string;
  qsfServiceType: string;
  allocation?: number;
  disbursements?: number;
  items: QSFAdminItem[];
  service: LienService;
  firmPaid: PaymentStatusAmount;
  claimantPaid: PaymentStatusAmount;

  public static toModel(item: any): QSFAdmin {
    if (!item) {
      return null;
    }

    return {
      qsfStatus: item.qsfStatus,
      qsfServiceType: item.qsfServiceType,
      allocation: item.allocation,
      disbursements: item.disbursements,
      items: item.items.map(QSFAdminItem.toModel),
      service: LienService.toModel(item.service),
      firmPaid: item.firmPaid,
      claimantPaid: item.claimantPaid,
    };
  }
}
