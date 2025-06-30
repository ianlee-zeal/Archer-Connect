export class AddressVerificationConfiguration {
    includeName: boolean;
    advancedAddressCorrection: boolean;

    constructor(model?: AddressVerificationConfiguration) {
        Object.assign(this, model);
    }

    public static toModel(item: any): AddressVerificationConfiguration {
        return {
            includeName: item.includeName,
            advancedAddressCorrection: item.advancedAddressCorrection
        }
    }

    public static toDto(item: AddressVerificationConfiguration): any {
        return {
            includeName: item.includeName,
            advancedAddressCorrection: item.advancedAddressCorrection
        }
    }
}