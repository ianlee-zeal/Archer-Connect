/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import { Injectable } from '@angular/core';
import { ChartOfAccountSettings, FormulaEngineParams } from '@app/models/closing-statement';
import { ClaimSettlementLedger } from '@app/models/closing-statement/claim-settlement-ledger';
import { LedgerValues } from '@app/models/closing-statement/ledger-values';
import { PaidStatuses } from '@app/models/enums';

@Injectable({ providedIn: 'root' })
export class FormulaEngineService {
  calc(
    claimSettlementLedger: ClaimSettlementLedger,
    chartOfAccountSettings: ChartOfAccountSettings[],
    formulaEngineFileName: string,
    recalc: boolean,
    initialLedgerValues: LedgerValues,
  ): Promise<FormulaEngineParams> {
    const args = <FormulaEngineParams>{
      ledgerAmountPrecision: 2,
      claimSettlementLedger,
      chartOfAccountSettings,
      recalc,
      initialLedgerValues,
      paidStatusIds: PaidStatuses,
    };

    return new Promise<FormulaEngineParams>((resolve, reject) => {
      try {
        const formulaEngine = require(`../../../../libraries/formula-engine/${formulaEngineFileName}`);
        formulaEngine((_, formulaResult) => resolve(formulaResult), args);
      } catch (e) {
        reject(e);
      }
    });
  }
}
