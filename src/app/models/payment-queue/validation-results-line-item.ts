import { FileImportResultStatus, ImportRecordStatus } from '../enums';
import { ValidationResultLineItemError } from '../file-imports/validation-result-line-item-error';

export class LienPaymentStageValidationResultsLineItem {
  rowNo: number;
  type: string;
  description: string;
  valid: boolean;
  errorList: ValidationResultLineItemError[];
  summary: string;
  fields: any;
  batchActionResultStatus: FileImportResultStatus;

  constructor(model?: LienPaymentStageValidationResultsLineItem) {
    Object.assign(this, model);
  }

  public static toModel(item: any): LienPaymentStageValidationResultsLineItem {
    return {
      rowNo: item.fields && item.fields.Id ? item.fields.Id : item.rowNo,
      type: item.type,
      description: item.description,
      valid: item.valid,
      errorList: item.errorList,
      fields: item.fields,
      summary: LienPaymentStageValidationResultsLineItem.getSummary(item),
      batchActionResultStatus: item.batchActionResultStatus,
    };
  }

  private static getSummary(item: any): string {
    let summary = '';
    if (!item.valid) {
      summary = ImportRecordStatus.Error;
    } else {
      summary = ImportRecordStatus.Success;
    }

    if (item.hasDeleted) {
      summary += ' - Deleted entries';
    }

    return summary;
  }
}
