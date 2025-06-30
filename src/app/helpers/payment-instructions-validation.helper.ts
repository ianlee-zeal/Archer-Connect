import { PaymentInstruction } from '@app/models';
import { PaymentMethodEnum, PaymentTypeEnum } from '@app/models/enums';
import { IPaymentInstructionsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { CommonHelper } from './common.helper';
import { CurrencyHelper } from './currency.helper';

export const QSF_ORG_NO_TRANSFER_ID: number = -1;

interface IPaymentInstructionValidation {
  isPercentageValid: boolean;
  isAmountValid: boolean;
  isFilled: boolean;
  isEmailValid: boolean;
}
export class PaymentInstructionsValidationHelper {
  public static validate(state: IPaymentInstructionsState): IPaymentInstructionValidation {
    let percentageSum = 0;
    let amountSum = 0;
    let isFilled = true;
    let isEmailValid = true;
    const multiplier = 10 ** (state.decimalsCount + 2);
    state.items.forEach((item: PaymentInstruction) => {
      percentageSum += item.percentage ? parseFloat(item.percentage.toString()) * multiplier : 0;
      amountSum += item.amount ? parseFloat(item.amount.toString()) * multiplier : 0;
      if (isFilled && !this.isPaymentFilled(item)) {
        isFilled = false;
      }
      if (state.paymentType !== PaymentTypeEnum.Default
        && item.paymentMethodId == PaymentMethodEnum.DigitalPayment
        && !item.payeeEmailId) {
        isEmailValid = false;
      }
    });

    percentageSum /= multiplier;
    amountSum /= multiplier;

    const result = {
      // if payment type is Split - percentageSum should always equal to 1
      isPercentageValid: percentageSum ? percentageSum === 1 : (state.paymentType !== PaymentTypeEnum.Split),
      isAmountValid: amountSum ? (CurrencyHelper.round(amountSum) === CurrencyHelper.round(state.amount || 0)) : true,
      isEmailValid,
      isFilled,
    };

    return result;
  }

  public static isPaymentFilled(item: PaymentInstruction): boolean {
    return ((item.transferToSubAccount ?? !!item.qsfOrgId) && item.qsfOrgId !== QSF_ORG_NO_TRANSFER_ID)
      ? this.paymentInstructionTransferIsFilled(item)
      : this.paymentInstructionIsFilled(item);
  }

  public static arePaymentsFilled(items: PaymentInstruction[]): boolean {
    let itemIsFilled = true; let index = 0;
    while (itemIsFilled && index < items.length) {
      const item = items[index];
      itemIsFilled = ((item.transferToSubAccount ?? !!item.qsfOrgId) && item.qsfOrgId !== QSF_ORG_NO_TRANSFER_ID)
        ? this.paymentInstructionTransferIsFilled(item)
        : this.paymentInstructionIsFilled(item);
      index++;
    }
    return itemIsFilled;
  }

  public static paymentInstructionTransferIsFilled(item: PaymentInstruction): boolean {
    return !CommonHelper.isNullOrUndefined(item.qsfOrgId)
      && !CommonHelper.isNullOrUndefined(item.qsfBankAccountId);
  }

  public static paymentInstructionIsFilled(item: PaymentInstruction): boolean {
    return item.payeeEntityId
      && item.paymentMethodId
      && ((item.paymentMethodId === PaymentMethodEnum.Check
        && !CommonHelper.isNullOrUndefined(item.payeeAddressId)
        && !CommonHelper.isBlank(item.payeeAddressId.toString()))
        || (item.paymentMethodId === PaymentMethodEnum.Wire
          && !CommonHelper.isNullOrUndefined(item.payeeBankAccountId)
          && !CommonHelper.isBlank(item.payeeBankAccountId.toString()))
        || (item.paymentMethodId === PaymentMethodEnum.DigitalPayment
          && !CommonHelper.isNullOrUndefined(item.payeeEmailId)
          && !CommonHelper.isBlank(item.payeeEmailId.toString()))
      );
  }
}
