import { MoveCheckConfigurationMonthsRequested } from './validation/movecheck-configuration-monthsrequested';

export class AddressMoveCheckConfiguration {
    monthsRequested: MoveCheckConfigurationMonthsRequested;

    constructor(model?: AddressMoveCheckConfiguration) {
        Object.assign(this, model);
    }

    public static toModel(item: any): AddressMoveCheckConfiguration {
        return {
            monthsRequested: item.monthsRequested
        }
    }

    public static toDto(item: AddressMoveCheckConfiguration): any {
        return {
            monthsRequested: item.monthsRequested
        }
    }
}