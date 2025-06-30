import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'modal-footer',
  templateUrl: './modal-footer.component.html',
  styleUrls: ['./modal-footer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalFooterComponent {
  /**
   * Gets or sets the flag which indicates that contents of the footer must be a
   * flex column instead of the row.
   *
   * @memberof ModalFooterComponent
   */
  @Input()
    isFlexRow = false;

  @Input()
    useAutoHeight = false;

  @Input()
    justifyContentSpaceBetween = false;
}
