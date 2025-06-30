export interface ManualPaymentItemRow {
  id: number;
  payeeType?: string;
  payeeOrganization?: string;
  organizationId?: number;
  clientId?: number;
  clientIdValue: string;
  overridePayeeName?: boolean;
  payeeName?: string;
  paymentType?: string;
  lienId?: number;
  amount?: number;
  paymentMethod?: string;
  furtherCreditAccount?: string;
  checkMemo?: string;
  email?: string;
  address?: string
  attn?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  rowId: number;
}

export class ManualPaymentItemRowModel {
  static toModel(item: any): ManualPaymentItemRow[] {
    return item.items.map((row: any) => {
      let address = row.address;

      if (address === "Enter Address") {
        address = "";
      } else if (address === "Use Payee Primary Address") {
        const hasPrimaryAddress =
          row.address1 && row.city;

        if (hasPrimaryAddress) {
          let address2 = row.address2 ? " " + row.address2 : "";
          let zip = row.zip ? " " + row.zip : "";
          let country = row.country ? ", " + row.country : "";
          let state = row.state ? ", " + row.state : "";
          address = `${row.address1}${address2}, ${row.city}${state}${country}${zip}`;
        }
        row.address1 = "";
        row.address2 = "";
        row.city = "";
        row.state = "";
        row.zip = "";
        row.country = "";
      }

      const result = {
        id: row.id,
        payeeType: row.payeeType,
        payeeOrganization: row.payeeOrganization,
        organizationId: row.organizationId,
        clientId: row.clientId,
        clientIdValue: row.clientIdValue,
        overridePayeeName: row.overridePayeeName,
        payeeName: row.payeeName,
        paymentType: row.paymentTypeString,
        lienId: row.lienId === 0 ? null : row.lienId,
        amount: row.amount,
        paymentMethod: row.paymentMethodString,
        furtherCreditAccount: row.furtherCreditAccount,
        checkMemo: row.checkMemo,
        email: row.email,
        address: address,
        attn: row.attn,
        address1: row.address1,
        address2: row.address2,
        city: row.city,
        state: row.state,
        zip: row.zip,
        country: row.country,
        rowId: row.rowId,
      };
      return result;
    });
  }
}
