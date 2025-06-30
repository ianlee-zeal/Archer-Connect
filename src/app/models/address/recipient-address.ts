import { Address } from './address';
import { EntityAddress } from '../entity-address';
import { AddressMoveCheckResult } from './address-movecheck-result';

export class RecipientAddress extends Address {
    entityId: number;
    entityType: number;

    constructor(model?: Partial<RecipientAddress>) {
        super(model);
        Object.assign(this, model);
    }

    public static toModel(item: any): RecipientAddress {
        return {
            ...Address.toModel(item),
            entityId: item.entityId,
            entityType: item.entityType
        };
    }

    public static toDto(item: RecipientAddress): any {
        return {
            ...Address.toDto(item),
            entityId: item.entityId,
            entityType: item.entityType
        };
    }

    public static fromEntityAddress(item: EntityAddress): RecipientAddress {
        return {
            ...Address.toModel(item),
            entityId: item.entityId,
            entityType: item.entityType
        }
    }

    public static fromMoveCheck(address: EntityAddress, item: AddressMoveCheckResult): any {
        return {
            ...EntityAddress.fromValidation(address, item),
            id: 0,
            StartDate: item.dateMoved,
            isPrimary: false,
            isActive: true,
            addressType: address.type,
            entityId: address.entityId,
            entityType: address.entityType
        }
    }
}
