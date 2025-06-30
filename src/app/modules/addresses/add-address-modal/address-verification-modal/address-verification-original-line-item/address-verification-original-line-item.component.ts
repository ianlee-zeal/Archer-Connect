import { Component, Input } from '@angular/core';

import { EntityAddress } from '@app/models';

@Component({
  selector: 'app-address-verification-original-line-item',
  templateUrl: './address-verification-original-line-item.component.html',
  styleUrls: ['./address-verification-original-line-item.component.scss'],
})
// This component will be able to be merged with 'AddressVerification-VALIDATED-LineItemComponent' in the future
// A refactor must be completed to bring frontend app address property names in line with backend address property names
export class AddressVerificationOriginalLineItemComponent {
  @Input() address: EntityAddress;
  @Input() name: string;

  public hasProperty(input: string): boolean {
    if (input) {
      return true;
    }

    return false;
  }
}
