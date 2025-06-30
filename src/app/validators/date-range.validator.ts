import { UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { default as moment } from 'moment-timezone';

export const dateRangeValidator = (fromFieldName: string, toFieldName: string) => {
  return (formGroup: UntypedFormGroup): ValidationErrors | null => {
    const from = formGroup.controls[fromFieldName].value;
    const to = formGroup.controls[toFieldName].value;

    if ((!from && !to) || (from && !to)) {
      return null;
    }

    if (!from && to) {
      return { invalidDateRange: true };
    }

    return moment(from).startOf('day').isBefore(to) ? null : { invalidDateRange: true };
  };
};
