import { ValidationResultsLineItem } from '.';
import { ImportErrorType, ImportValidationErrorType } from '../enums';

export class ValidationResultErrorGridRow {
  rowNo: number;
  Id: string;
  description: string;
  valid: boolean;
  fields: any;
  type: ImportErrorType;
  validationType: ImportValidationErrorType;
  property: string;
  data: string;
  summary: string;

  public static toArrayOfModels(item: ValidationResultsLineItem): ValidationResultErrorGridRow[] {
    if (!item) {
      return [];
    }

    const arrayOfModels = item.errorList.map(error => ({
      ...error,
      rowNo: item.rowNo,
      Id: item.fields ? item.fields.Id : item.rowNo,
      description: item.description,
      valid: item.valid,
      fields: item.fields,
    }));

    return arrayOfModels;
  }

  public static toFlattenedArrayOfModels(items: ValidationResultsLineItem[]): ValidationResultErrorGridRow[] {
    if (!items) {
      return [];
    }

    const flattenedArrayOfModels: ValidationResultErrorGridRow[] = [];

    for (const validationResultLineItem of items) {
      flattenedArrayOfModels.push(...ValidationResultErrorGridRow.toArrayOfModels(validationResultLineItem));
    }

    return flattenedArrayOfModels;
  }
}
