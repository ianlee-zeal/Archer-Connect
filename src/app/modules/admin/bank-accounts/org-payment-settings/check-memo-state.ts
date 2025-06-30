import { UntypedFormGroup } from '@angular/forms';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { CheckMemoOptions } from '@app/models/enums/check-memo.enum';
import { SelectHelper } from '@app/helpers/select.helper';
import { Dictionary } from '@app/models/utils';
import { Org } from '@app/models';

export class CheckMemoState {
  public displayedCheckMemos: string[] = [];
  public checkMemoOptions: SelectOption[] = SelectHelper.toOptions<string>(Object.keys(CheckMemoOptions), item => item, item => CheckMemoOptions[item]);
  public selectedCheckMemos = new Dictionary<string, string>();
  public isAllCheckMemoChecked = false;

  constructor(private readonly orgPaymentDetailsForm: UntypedFormGroup) {

  }

  public initCheckMemos(org: Org): void {
    if (!org) return;

    const memo = org.defaultCheckMemoFormat?.split(/[_^{\s}]+/).filter(s => !!s) ?? [];

    this.displayedCheckMemos = memo.map(item => CheckMemoOptions[item]);

    this.checkMemoOptions.forEach((type, index) => {
      const checked = this.displayedCheckMemos.includes(CheckMemoOptions[type.id]);
      this.checkMemoOptions[index] = { ...type, checked };
      this.updateSelectedCheckMemos(type.id as string, checked);
    });
  }

  public onCheckMemoCheckboxChange({ id, checked }): void {
    if (this.isAllCheckMemoChecked && !checked) {
      this.isAllCheckMemoChecked = false;
    }
    this.updateSelectedCheckMemos(id, checked);
    this.updateCheckMemoFormControl();
    this.updateDisplayedCheckMemos();
  }

  public onCheckMemoSelectAllChange(checked: boolean): void {
    this.checkMemoOptions.forEach((type, index) => {
      this.checkMemoOptions[index] = { ...type, checked };
      this.updateSelectedCheckMemos(type.id as string, checked);
    });
    this.isAllCheckMemoChecked = checked;
    this.updateCheckMemoFormControl();
    this.updateDisplayedCheckMemos();
  }

  private updateDisplayedCheckMemos(): void {
    this.displayedCheckMemos = this.selectedCheckMemos.values();
  }

  private updateSelectedCheckMemos(id: string, checked: boolean): void {
    if (checked) {
      this.selectedCheckMemos.setValue(id, CheckMemoOptions[id]);
    } else {
      this.selectedCheckMemos.remove(id);
    }
  }

  private updateCheckMemoFormControl(): void {
    const checkMemoFormatted = this.selectedCheckMemos.keys().map(item => `{${item}}`).join('_');
    this.orgPaymentDetailsForm.controls.defaultCheckMemo.setValue(checkMemoFormatted);
    this.orgPaymentDetailsForm.markAsTouched();
    this.orgPaymentDetailsForm.markAsDirty();
  }
}
