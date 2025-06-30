export enum JiraFieldRenderTypeEnum {
  Unknown,
  TextInput,
  MultilineText,
  NumberInput,
  DatePicker,
  DateTimePicker,
  SingleSelect,
  MultiSelect,
  Labels,
  FileUpload
}

export class JiraFieldRenderTypeHelper {

  static getComponentType(fieldType: JiraFieldRenderTypeEnum): string {
    const typeMap = {
      [JiraFieldRenderTypeEnum.SingleSelect]: 'dropdown',
      [JiraFieldRenderTypeEnum.MultiSelect]: 'dropdown',
      [JiraFieldRenderTypeEnum.TextInput]: 'input',
      [JiraFieldRenderTypeEnum.MultilineText]: 'input',
      [JiraFieldRenderTypeEnum.NumberInput]: 'input',
      [JiraFieldRenderTypeEnum.DatePicker]: 'dateInput',
      [JiraFieldRenderTypeEnum.DateTimePicker]: 'dateInput',
    };

    return typeMap[fieldType] || 'unknown';
  }

  static getInputConfig(fieldType: JiraFieldRenderTypeEnum): string {
    const configMap = {
      [JiraFieldRenderTypeEnum.NumberInput]: 'number',
      [JiraFieldRenderTypeEnum.MultilineText]: 'text',
      [JiraFieldRenderTypeEnum.TextInput]: 'text',
    };

    return configMap[fieldType] || 'text';
  }

  static getDropdownMultiselect(fieldType: JiraFieldRenderTypeEnum): boolean {
    const isMultiselect = {
      [JiraFieldRenderTypeEnum.SingleSelect]: false,
      [JiraFieldRenderTypeEnum.MultiSelect]: true,
    };

    return isMultiselect[fieldType] || false;
  }
}