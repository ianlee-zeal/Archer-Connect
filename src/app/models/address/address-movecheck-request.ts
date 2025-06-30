import { RecipientAddress } from './recipient-address';
import { AddressMoveCheckConfiguration } from './address-movecheck-configuration';

export class AddressMoveCheckRequest {
    address: RecipientAddress = new RecipientAddress();
    configuration: AddressMoveCheckConfiguration = new AddressMoveCheckConfiguration();

    constructor(model?: AddressMoveCheckRequest) {
        Object.assign(this, model);
    }

    public static toModel(item: any): AddressMoveCheckRequest {
        return {
            address: RecipientAddress.toModel(item.address),
            configuration: AddressMoveCheckConfiguration.toModel(item.configuration)
        };
    }

    public static toDto(address: RecipientAddress, config: AddressMoveCheckConfiguration): AddressMoveCheckRequest {
        return {
            address: RecipientAddress.toDto(address),
            configuration: AddressMoveCheckConfiguration.toDto(config)
        };
    }
}
