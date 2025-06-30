import { IdValue } from '..';
import { BillingRule } from '../billing-rule/billing-rule';
import { Claimant } from '../claimant';
import { LienProduct } from '../liens/lien-product';

export class InvoiceItem {
  id: number;
  calculatedAmount: number;
  invoiceAmount: number;
  invoiceNumber: string;
  invoiceStage: string;
  invoicedDate: Date;
  paidAmount: number;
  paidDate: Date;
  generatedDate: Date;
  billingRule: BillingRule;
  client: Claimant;
  lienProduct: LienProduct;
  relatedEntityType: IdValue;
  relatedEntityTypeId: number;
  case?: IdValue;

  public static toModel(item: any): InvoiceItem {
    if (!item) return null;

    return {
      id: item.id,
      calculatedAmount: item.calculatedAmount,
      invoiceAmount: item.invoiceAmount,
      invoiceNumber: item.invoiceNumber,
      invoiceStage: item.invoiceStage,
      invoicedDate: item.invoicedDate,
      paidAmount: item.paidAmount,
      paidDate: item.paidDate,
      generatedDate: item.generatedDate,
      billingRule: BillingRule.toModel(item.billingRule),
      client: Claimant.toModel(item.client),
      lienProduct: LienProduct.toModel(item.lienProduct),
      relatedEntityType: item.relatedEntityType,
      relatedEntityTypeId: item.relatedEntityTypeId,
      case: {id: item.case?.id, name: item.case?.name},
    };
  }
}
