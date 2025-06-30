import { Injectable } from '@angular/core';
import { OrgType } from '@app/models/enums/ledger-settings/org-type';
import { QSFType } from '@app/models/enums/ledger-settings/qsf-type';

@Injectable({ providedIn: 'root' })
export class FirmMoneyMovementDefaultValues {
  updateDefaultValues(qsfProductId: number, specialInstructions?: string) {
    const firmMoneyMovementValues = {
      primaryFirmPayments: null,
      referingFirmPayments: null,
      settlementCounselPayments: null,
      specialInstructions: specialInstructions || null,
    };

    if (qsfProductId === QSFType.Enhanced) {
      firmMoneyMovementValues.primaryFirmPayments = OrgType.PrimaryFirm;
      firmMoneyMovementValues.referingFirmPayments = OrgType.PrimaryFirm;
      firmMoneyMovementValues.settlementCounselPayments = OrgType.SettlementFirm;
    } else if (qsfProductId === QSFType.GrossToFirm) {
      firmMoneyMovementValues.primaryFirmPayments = OrgType.PrimaryFirm;
      firmMoneyMovementValues.referingFirmPayments = OrgType.ReferringFirm;
      firmMoneyMovementValues.settlementCounselPayments = OrgType.SettlementFirm;
    } else if (qsfProductId === QSFType.FirmDirected) {
      firmMoneyMovementValues.primaryFirmPayments = OrgType.PrimaryFirm;
      firmMoneyMovementValues.referingFirmPayments = OrgType.PrimaryFirm;
      firmMoneyMovementValues.settlementCounselPayments = OrgType.PrimaryFirm;
    } else {
      firmMoneyMovementValues.primaryFirmPayments = OrgType.PrimaryFirm;
      firmMoneyMovementValues.referingFirmPayments = OrgType.PrimaryFirm;
      firmMoneyMovementValues.settlementCounselPayments = OrgType.PrimaryFirm;
    }

    return firmMoneyMovementValues;
  }
}
