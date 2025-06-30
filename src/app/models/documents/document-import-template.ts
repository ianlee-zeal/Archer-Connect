import { FileImportTemplateTypes } from '../enums/file-import-templates-types.enum';
import { FileImportTemplateConfig } from '../file-imports/config/config-base';
import { IntakeTemplate } from '../file-imports/config/intake-config';

export class DocumentImportTemplate {
  id: number;
  name: string;
  config: FileImportTemplateConfig;
  isPrimary: boolean;
  provideTemplate: boolean;
  templateCategoryId: number;

  constructor(model?: DocumentImportTemplate) {
    Object.assign(this, model);
  }

  public static toModel(item: any): DocumentImportTemplate {
    if (!item) {
      return null;
    }

    const parsedConfig = item.config ? JSON.parse(item.config) : null;

    return {
      id: item.id,
      name: item.name,
      config: DocumentImportTemplate.getTypedConfig(item.id, parsedConfig),
      isPrimary: item.isPrimary,
      provideTemplate: item.provideTemplate,
      templateCategoryId: item.templateCategoryId,
    };
  }

  private static getTypedConfig(templateId: number, parsedConfig: any): FileImportTemplateConfig | null {
    switch (templateId) {
      case FileImportTemplateTypes.Intake:
        return new IntakeTemplate(parsedConfig);
      default:
        return null;
    }
  }
}
