import { IdValue } from '../idValue';
import { DocumentImportTemplate } from './document-import-template';

export interface IUploadBulkDropdownData {
  organizations: IdValue[];
  templateCategories: IdValue[];
  templates: DocumentImportTemplate[];
}
