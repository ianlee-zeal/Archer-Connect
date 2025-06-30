import { DateHelper } from '@app/helpers/date.helper';
import { Auditable } from './auditable';
import { EntityType } from './entity-type';
import { TransferItemStatus } from './enums';

export class TransferItem extends Auditable {
  id: string;
  accountGroupNo: string;
  accountNo: string;
  amount: number | null;
  attorneyReferenceId: string | null;
  claimantId: number;
  claimantName: string;
  entityId: number;
  entityType: EntityType;
  externalAccountNo: string;
  furtherCreditAccount: string | null;
  ledgerId: number;
  payeeMMConditionId: number;
  payeeOrgId: number;
  paymentItemTypeId: number;
  qsfBankAccountId: number;
  qsfOrgId: number;
  status: number;
  statusName: string;

  constructor(model?: Partial<TransferItem>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): TransferItem {
    return {
      ...super.toModel(item),
      id: item.id,
      createdDate: DateHelper.toLocalDate(item.createdDate),
      lastModifiedDate: DateHelper.toLocalDate(item.lastModifiedDate),
      accountGroupNo: item.accountGroupNo,
      accountNo: item.accountNo,
      amount: item.amount,
      attorneyReferenceId: item.attorneyReferenceId,
      claimantId: item.claimantId,
      claimantName: item.clamantName,
      entityId: item.entityId,
      entityType: item.entityType,
      externalAccountNo: item.externalAccountNo,
      furtherCreditAccount: item.furtherCreditAccount,
      ledgerId: item.ledgerId,
      payeeMMConditionId: item.payeeMMConditionId,
      payeeOrgId: item.payeeOrgId,
      paymentItemTypeId: item.paymentItemTypeId,
      qsfBankAccountId: item.qsfBankAccountId,
      qsfOrgId: item.qsfOrgId,
      status: item.status,
      statusName: TransferItemStatus[item.status]
    };
  }
}
