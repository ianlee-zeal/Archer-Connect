import { BKScrubStatusCodesEnum } from '@app/models/enums/bk-scrub-status-codes.enum';
import { DeficiencyStatus, DeficiencyStatusFilterValues } from '@app/models/enums/deficiency-status.enum';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { Observable, of } from 'rxjs';
import { PaymentMethodEnum } from '@app/models/enums/payment-method.enum';
import { DigitalPaymentStatus } from '@app/models/enums/digital-payment-status.enum';
import { SelectHelper } from './select.helper';

export class ObservableOptionsHelper {
  public static getYesNoOptions() : Observable<SelectOption[]> {
    return of([
      { id: 'true', name: 'Yes' },
      { id: 'false', name: 'No' },
    ]);
  }

  public static getHoldbackOptions() : SelectOption[] {
    return [
      { id: 'coA50920Amount', name: '50920 - Attorney Fee' },
      { id: 'coA50195Amount', name: '50195 - Attorney Expenses' },
      { id: 'coA54920Amount', name: '54920 - 3rd Party' },
      { id: 'coA51010Amount', name: '51010 - Lien Data' },
      { id: 'coA52910Amount', name: '52910 - ARCHER Fees' },
      { id: 'coA53920Amount', name: '53920 - Other Fees' },
    ];
  }

  public static getHoldbackOptionsForRollback() : SelectOption[] {
    return [
      { id: 'disbursementGroupSummary.holdbackAttorneyFees', name: '50920 - Attorney Fee' },
      { id: 'disbursementGroupSummary.holdbackAttorneyExpenses', name: '50195 - Attorney Expenses' },
      { id: 'disbursementGroupSummary.holdbackThirdPartyFees', name: '54920 - 3rd Party' },
      { id: 'disbursementGroupSummary.holdbackLienFees', name: '51010 - Lien Data' },
      { id: 'disbursementGroupSummary.holdbackARCHERFees', name: '52910 - ARCHER Fees' },
      { id: 'disbursementGroupSummary.holdbackOtherFees', name: '53920 - Other Fees' },
    ];
  }

  public static getUnpaidLedgerEntriesOptionsForRollback() : SelectOption[] {
    return [
      { id: 'disbursementGroupSummary.unpaidMDL', name: '49020 - MDL' },
      { id: 'disbursementGroupSummary.unpaidCBF', name: '49030 - CBF' },
      { id: 'disbursementGroupSummary.unpaidAttyFees', name: '50000 - Atty Fees' },
      { id: 'disbursementGroupSummary.unpaidAttyExpenses', name: '50100 - Atty Expenses' },
      { id: 'disbursementGroupSummary.unpaidLiens', name: '51000 - Liens' },
      { id: 'disbursementGroupSummary.unpaidARCHERFees', name: '52000 - ARCHER Fees' },
      { id: 'disbursementGroupSummary.unpaidOtherFees', name: '53000 - Other Fees' },
      { id: 'disbursementGroupSummary.unpaidOtherLiens', name: '54000 - 3rd Party Payments' },
    ];
  }

  public static getDeficiencyStatusOptions() : SelectOption[] {
    return [
      { id: DeficiencyStatusFilterValues[DeficiencyStatus.Cured], name: DeficiencyStatus.Cured },
      { id: DeficiencyStatusFilterValues[DeficiencyStatus.Active], name: DeficiencyStatus.Active },
    ];
  }

  public static getBKStatusFilter(): SelectOption[] {
    return SelectHelper.enumToOptions(BKScrubStatusCodesEnum, (option: SelectOption) => option.id, (option: SelectOption) => option.name);
  }

  public static getClaimantPaymentMethodOptions() : SelectOption[] {
    return [
      { id: PaymentMethodEnum.Check, name: 'Check' },
      { id: PaymentMethodEnum.DigitalPayment, name: 'Digital Payment' },
    ];
  }

  public static getDigitalPaymentStatusOptions() : SelectOption[] {
    return [
      { id: DigitalPaymentStatus.Yes, name: 'Yes' },
      { id: DigitalPaymentStatus.No, name: 'No' },
      { id: DigitalPaymentStatus.Pending, name: 'Pending' },
    ];
  }
}
