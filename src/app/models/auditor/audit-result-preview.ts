import { AuditValidationResultTypes } from '@app/models/enums/audit-batch-uploading.enum';
import { Status } from '@app/models/status';
import { AuditValidationResultsLineItem } from './audit-validation-results-line-item';

export class AuditResultPreview {
  auditRunId: number;
  clientName: string;
  jsonData: string;
  lienHolderName: string;
  lienId: number;
  previewStatusId: number;
  totalLienAmount: number;
  auditedLienAmount: number;

  status: Status;
  auditValidationResult: AuditValidationResultsLineItem;

  constructor(model?: Partial<AuditResultPreview>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): AuditResultPreview {
    return {
      ...item,
      status: Status.toModel({ id: item.previewStatusId, name: item.previewStatusId ? AuditValidationResultTypes[item.previewStatusId] : '' }),
      auditValidationResult: item.jsonData ? AuditValidationResultsLineItem.toModel(JSON.parse(item.jsonData).DataValidationResult) : {},
    };
  }
}
