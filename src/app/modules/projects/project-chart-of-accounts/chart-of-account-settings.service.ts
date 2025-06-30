import { Injectable } from '@angular/core';
import { ChartOfAccountProjectConfig } from '@app/models';
import { ChartOfAccountMode as ChartOfAccountModeEnum } from '@app/models/enums/chart-of-account-mode.enum';
import { LedgerAccountGroup } from '@app/models/enums';

@Injectable({
  providedIn: 'root',
})
export class ChartOfAccountSettingsService {

  public isIncludeInCostEnabled(data: ChartOfAccountProjectConfig, chartOfAccounts: ChartOfAccountProjectConfig[]): boolean {
    let result = data.chartOfAccountIncludeInCostVisible ?? false;
    if (result && data.chartOfAccountAccountGroupNo === LedgerAccountGroup.CommonBenefit) {
      const coaGroupCommonBenefit = chartOfAccounts.find((i: ChartOfAccountProjectConfig) => i.chartOfAccountAccountNo === LedgerAccountGroup.CommonBenefit);
      return ![ChartOfAccountModeEnum.CBFOTTAmount, ChartOfAccountModeEnum.CBFOTTPercent].includes(coaGroupCommonBenefit.defaultModeId);
    }

    return result;
  }
}
