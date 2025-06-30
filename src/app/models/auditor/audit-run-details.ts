export class AuditRunDetails {
  auditRunId: number;
  lienId?: number;
  productIdentificationNumber: string;
  productLienHolderName: string;
  productLienDate1: Date;
  productLienAmount1: number;
  productAuditedAmount1: number;
  productHoldBackAmount?: number;
  clientId?: number;
  clientDrugIngested: string;
  clientLastName: string;
  clientFirstName: string;
  clientSsn: string;
  clientInjuryDate?: Date;
  clientIngestionDate?: Date;
  clientDescriptionOfInjury: string;
  clientSettlementDate?: Date;
  clientSettlementAmount: number;
  medicalCodeSetId?: number;
  auditProtocolId?: number;
  resultStatusId?: number;
  tortName?: string;

  static toModel(item: AuditRunDetails | any) : AuditRunDetails | null {
    if (item) {
      return {
        ...item,
        productLienDate1: item.productLienDate1 ? new Date(item.productLienDate1) : null,
        clientInjuryDate: item.clientInjuryDate ? new Date(item.clientInjuryDate) : null,
        clientIngestionDate: item.clientIngestionDate ? new Date(item.clientIngestionDate) : null,
        clientSettlementDate: item.clientSettlementDate ? new Date(item.clientSettlementDate) : null,
      };
    }

    return null;
  }
}
