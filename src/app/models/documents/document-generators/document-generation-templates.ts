import { IdValue } from '@app/models';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';

export interface IDocumentGenerationTemplates {
  template?: IdValue,
  templates: IdValue[],
  templateOptions?: SelectOption[],
  outputFileTypeOptions?: SelectOption[],
  outputTypeOptions?: SelectOption[],
  allOutputFileTypesOptions?: SelectOption[],
  validOutputTypeOptions?: number[],
}
