import { RecipientAddress } from './recipient-address';
import { AddressVerificationConfiguration } from './address-verification-configuration';

export class AddressVerificationRequest {
    address: RecipientAddress = new RecipientAddress();
    configuration: AddressVerificationConfiguration = new AddressVerificationConfiguration();

    constructor(model?: AddressVerificationRequest) {
        Object.assign(this, model);
    }

    public static toModel(item: any): AddressVerificationRequest {
        return {
            address: RecipientAddress.toModel(item.address),
            configuration: AddressVerificationConfiguration.toModel(item.configuration)
        };
    }

    public static toDto(address: RecipientAddress, config: AddressVerificationConfiguration): any {
        return {
            address: RecipientAddress.toDto(address),
            configuration: AddressVerificationConfiguration.toDto(config)
        };
    }
}
