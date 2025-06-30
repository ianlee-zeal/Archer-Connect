import { VerifiedAddress } from './verified-address';

export class AddressMoveCheckResult extends VerifiedAddress {
  dateMoved: Date;

  constructor(model?: Partial<AddressMoveCheckResult>) {
    super(model);

    Object.assign(this, model);
  }

  public static toModel(item: any): AddressMoveCheckResult {
    return {
      ...VerifiedAddress.toModel(item),
      dateMoved: item.dateMoved
    };
  }
}
