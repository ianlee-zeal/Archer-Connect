import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ElectionFormTotalCalculatorService {
  public calcTotal(lumpSumAmount: number, structuredSettlementAmount: number, specialNeedsTrustAmount: number): number {
    return lumpSumAmount + structuredSettlementAmount + specialNeedsTrustAmount;
  }
}
