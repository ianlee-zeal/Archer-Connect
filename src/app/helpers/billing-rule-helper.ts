import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { IdValue } from '@app/models';
import { FeeScopeEnum } from '@app/models/enums/billing-rule/fee-scope.enum';
import { ToggleState } from '@app/models/enums/toggle-state.enum';

export class BillingRuleHelper {
  static getRelatedServiceRequiredMessage(feeScope: FeeScopeEnum, isRelatedServiceRequired: boolean): string {
    if (isRelatedServiceRequired) {
      if (feeScope === FeeScopeEnum.Product) {
        return 'N/A. You cannot set the control to No if the fee scope is Product';
      }
      return null;
    }
    switch (feeScope) {
      case FeeScopeEnum.Claimant:
        return 'Charged to all settling claimants';
      case FeeScopeEnum.Project:
        return 'Project-level fee';
      default:
        return null;
    }
  }

  static updateIsRelatedServiceRequiredControl(relatedServiceRequiredControl: AbstractControl, selectedFeeScope: IdValue) {
    if (selectedFeeScope?.id === FeeScopeEnum.Product) {
      relatedServiceRequiredControl?.setValue(true);
      relatedServiceRequiredControl?.disable();
    } else {
      relatedServiceRequiredControl?.setValue(false);
      relatedServiceRequiredControl?.enable();
    }
  }

  static isTrue(form: UntypedFormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return control?.value === ToggleState.Yes || control?.value === true;
  }
}
