import { DocumentImport } from '@app/models/documents';
import { FileImportETLStatusEnum, TempaltesWithoutConfigStage, UploadBulkDocumentStage, UploadBulkDocumentStageWithoutConfigure } from '@app/models/enums';

export class FileImportHelper {
  public static getStageByStatusId(statusId: number, documentImport: DocumentImport): UploadBulkDocumentStage | UploadBulkDocumentStageWithoutConfigure {
    switch (statusId) {
      case FileImportETLStatusEnum.Submitted:
      case FileImportETLStatusEnum.Validating:
      case FileImportETLStatusEnum.Error:
        return FileImportHelper.getStages(documentImport).Upload;
      case FileImportETLStatusEnum.Pending:
        return FileImportHelper.getStages(documentImport).Review;
      case FileImportETLStatusEnum.Loading:
      case FileImportETLStatusEnum.Processing:
      case FileImportETLStatusEnum.Complete:
        return FileImportHelper.getStages(documentImport).Result;
      default:
        return FileImportHelper.getStages(documentImport).Select;
    }
  }

  public static getStages(documentImport: DocumentImport) {
    const isTemplateWithoutConfigStage = Object.values(TempaltesWithoutConfigStage).includes(documentImport.templateId);
    return documentImport.config && isTemplateWithoutConfigStage ? UploadBulkDocumentStageWithoutConfigure : UploadBulkDocumentStage;
  }
}
