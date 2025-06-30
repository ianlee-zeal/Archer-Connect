import { AuditDataValidationFieldTypes } from '@app/models/enums/audit-data-validation-field-type.enum';
import { AuditValidationResultTypes } from '@app/models/enums/audit-batch-uploading.enum';

export class AuditValidationResultsLineItem {
  field: number;
  fieldValue: string;
  value: any;
  resultType: number;
  resultTypeValue: string;
  summary: string;

  constructor(model?: Partial<AuditValidationResultsLineItem>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): AuditValidationResultsLineItem {
    return {
      field: item.Field,
      fieldValue: AuditDataValidationFieldTypes[item.Field],
      value: item.Value,
      resultType: item.ResultType,
      resultTypeValue: AuditValidationResultTypes[item.ResultType],
      summary: item.Summary,
    };
  }
}
