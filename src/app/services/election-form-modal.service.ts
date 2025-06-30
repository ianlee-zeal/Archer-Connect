/* eslint-disable no-param-reassign */
import { Injectable } from '@angular/core';
import { ClaimantElection } from '@app/models';
import { ElectionPaymentMethod } from '@app/models/enums';
import { LogService } from './log-service';

export interface ElectionFormAmountFields {
  combinationLumpSumAmount?: number;
  combinationSpecialNeedsTrustAmount?: number;
  combinationStructuredSettlementAmount?: number;
  lumpSumAmount?: number;
  specialNeedsTrustAmount?: number;
  structuredSettlementAmount?: number;
}

@Injectable({ providedIn: 'root' })
export class ElectionFormModalService {
  constructor(private logger: LogService) {}

  public getAmountFieldsFromElectionForm(electionForm: ClaimantElection): ElectionFormAmountFields {
    const amountFields: ElectionFormAmountFields = {};

    switch (electionForm.efPaymentMethodId) {
      case ElectionPaymentMethod.Combination:
        amountFields.combinationLumpSumAmount = electionForm.lumpSumAmount;
        amountFields.combinationSpecialNeedsTrustAmount = electionForm.specialNeedsTrustAmount;
        amountFields.combinationStructuredSettlementAmount = electionForm.structuredSettlementAmount;
        break;
      case ElectionPaymentMethod.LumpSumPayment:
        amountFields.lumpSumAmount = electionForm.lumpSumAmount;
        break;
      case ElectionPaymentMethod.SpecialNeedsTrust:
        amountFields.specialNeedsTrustAmount = electionForm.specialNeedsTrustAmount;
        break;
      case ElectionPaymentMethod.StructuredSettlement:
        amountFields.structuredSettlementAmount = electionForm.structuredSettlementAmount;
        break;
      default:
        this.logger.log('Election Payment Method not found');
    }

    return amountFields;
  }

  public fillElectionFormAmountFields(electionForm: ClaimantElection, formValue: ElectionFormAmountFields): void {
    switch (electionForm.efPaymentMethodId) {
      case ElectionPaymentMethod.Combination:
        electionForm.lumpSumAmount = formValue.combinationLumpSumAmount;
        electionForm.specialNeedsTrustAmount = formValue.combinationSpecialNeedsTrustAmount;
        electionForm.structuredSettlementAmount = formValue.combinationStructuredSettlementAmount;
        break;
      case ElectionPaymentMethod.LumpSumPayment:
        electionForm.lumpSumAmount = formValue.lumpSumAmount;
        break;
      case ElectionPaymentMethod.SpecialNeedsTrust:
        electionForm.specialNeedsTrustAmount = formValue.specialNeedsTrustAmount;
        break;
      case ElectionPaymentMethod.StructuredSettlement:
        electionForm.structuredSettlementAmount = formValue.structuredSettlementAmount;
        break;
      default:
        this.logger.log('Election Payment Method not found');
    }
  }
}
