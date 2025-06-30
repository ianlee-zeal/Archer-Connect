import { FileImportControlConfigTypes } from "@app/models/enums";
import { SplitCamelCasePipe } from "@app/modules/shared/_pipes";

export abstract class FileImportTemplateConfig {
    constructor(fields?: any) {
        Object.assign(this, fields);
    }

    getControlsConfig(): FileImportTemplateConfig {
        return this;
    }

    getControlType(key: string): FileImportControlConfigTypes {
        switch (this.getTypeofProperty(key)) {
            case 'boolean':
                return FileImportControlConfigTypes.FormCheck;
            case 'string':
            case 'number':
                return FileImportControlConfigTypes.Text;
            case 'list':
                return FileImportControlConfigTypes.DropDown;
        }
    }

    getFieldName(key: string): string {
        switch (key) {
            case 'RunMatchingLogicWithValidation':
                return 'Process matching logic during initial file validation';
            default:
                const splitCamelCasePipe: SplitCamelCasePipe = new SplitCamelCasePipe();
                return splitCamelCasePipe.transform(key);
        }
    }

    getFieldTooltip(key: string): string {
        switch (key) {
            case 'RunMatchingLogicWithValidation':
                return 'This setting will increase the time to complete the 3rd step of file import, due to matching logic running. If not selected, the matching logic will be run when the file is approved in Step 4.';
            default:
                return '';
        }
    }

    protected getTypeofProperty(key: string): string {
        if (Array.isArray(this[key])) {
            return 'list';
        }
        return typeof this[key];
    }

}