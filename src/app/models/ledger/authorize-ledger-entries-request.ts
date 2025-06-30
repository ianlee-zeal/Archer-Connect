import { PaymentTypeEnum } from '../enums';
import { ISearchOptions } from '../search-options';

export class AuthorizeLedgersEntriesRequest {
  ledgersEntitiesSearchOption: ISearchOptions;
  ledgerEntryId: number;
  notes: string;
  paymentType: PaymentTypeEnum;
}
