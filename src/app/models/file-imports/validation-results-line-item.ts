import { FileImportResultStatus, ImportRecordStatus } from '../enums';
import { ResultLineItemDeleted } from './result-line-item-deleted';
import { ValidationResultLineItemError } from './validation-result-line-item-error';

export class ValidationResultsLineItem {
  rowNo: number;
  type: string;
  description: string;
  valid: boolean;
  hasDeleted: boolean;
  errorList: ValidationResultLineItemError[];
  deletedList: ResultLineItemDeleted[];
  fields: any;
  summary: string;
  importResultStatus: FileImportResultStatus;
  contactName?: string;
  property?: string;

  constructor(model?: ValidationResultsLineItem) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ValidationResultsLineItem {
    return {
      rowNo: item.fields && item.fields.Id ? item.fields.Id : item.rowNo,
      type: item.type,
      description: item.description,
      valid: item.valid,
      hasDeleted: item.hasDeleted,
      errorList: item.errorList,
      deletedList: item.deletedList,
      fields: item.fields,
      summary: ValidationResultsLineItem.getSummary(item),
      importResultStatus: item.importResultStatus,
      contactName: item.contactName,
      property: item.contactName,
    };
  }

  private static getSummary(item: any): string {
    let summary = '';
    if (!item.valid) {
      summary = ImportRecordStatus.Error;
    } else if (item.valid && item.errorList.length) {
      summary = ImportRecordStatus.Warning;
    } else {
      summary = ImportRecordStatus.Success;
    }

    if (item.hasDeleted) {
      summary += ' - Deleted entries';
    }

    return summary;
  }
}
