import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-address-verification-validated-line-item',
  templateUrl: './address-verification-validated-line-item.component.html',
  styleUrls: ['./address-verification-validated-line-item.component.scss'],
})
// This component will be able to be merged with 'AddressVerification-ORIGINAL-LineItemComponent' in the future
// A refactor must be completed to bring frontend app address property names in line with backend address property names
// This should be the utilized one, as it is also used in MoveCheckAddressComponent to display list of MoveCheckAddresses
export class AddressVerificationValidatedLineItemComponent {
  @Input() address: any;

  constructor() {}

  public hasProperty(input: string): boolean {
    return !!input;
  }
}
