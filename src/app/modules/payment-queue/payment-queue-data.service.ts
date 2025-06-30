import { Injectable } from '@angular/core';
import { SelectHelper } from '@app/helpers/select.helper';
import { LedgerAccount } from '@app/models/ledger-account';
import { LedgerAccountGroup } from '@app/models/ledger-account-group';
import { Store } from '@ngrx/store';
import { AppState, sharedSelectors } from '@shared/state';
import { filter, map } from 'rxjs/operators';
import { ledgerStages } from '@app/modules/claimants/claimant-details/state/selectors';
import { IdValue } from '@app/models';
import { bankruptcyStatuses } from '@app/modules/projects/project-disbursement-payment-queue/state/selectors';

@Injectable({
  providedIn: 'root',
})
export class PaymentQueueDataService {
  constructor(
    public store: Store<AppState>,
  ) {

  }

  public readonly ledgerAccountGroups$ = this.store.select(sharedSelectors.dropDownsValuesSelectors.ledgerAccountGroups).pipe(
    filter((items: LedgerAccountGroup[]) => !!items),
    map((items: LedgerAccountGroup[]) => SelectHelper.toOptions(
      items,
      (opt: LedgerAccountGroup) => opt.accountGroupName,
      (opt: LedgerAccountGroup) => `(${opt.accountGroupNo}) ${opt.accountGroupName}`,
    )),
  );

  public readonly ledgerAccounts$ = this.store.select(sharedSelectors.dropDownsValuesSelectors.ledgerAccounts).pipe(
    filter((items: LedgerAccount[]) => !!items),
    map((items: LedgerAccount[]) => SelectHelper.toOptions(
      items,
      (opt: LedgerAccount) => opt.accountName,
      (opt: LedgerAccount) => `(${opt.accountNo}) ${opt.accountName}`,
    )),
  );

  public readonly ledgerStages$ = this.store.select(ledgerStages);
  public readonly ledgerStagesSelectOptions$ = this.ledgerStages$.pipe(
    map((items: IdValue[]) => SelectHelper.toOptions(
      items,
      (opt: IdValue) => opt.id,
      (opt: IdValue) => `${opt.name}`,
    )),
  );

  public readonly bankruptcyStatuses$ = this.store.select(bankruptcyStatuses);
}
