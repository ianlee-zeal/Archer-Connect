
import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Dropdown menu for top navigation bar
 *
 * @export
 * @class TopNavDropdownMenuComponent
 */
@Component({
  selector: 'app-top-nav-dropdown-help',
  templateUrl: './top-nav-dropdown-help.component.html',
  styleUrls: ['./top-nav-dropdown-help.component.scss']
})
export class TopNavDropdownHelpComponent {

  /**
   * Event fired when menu should be closed
   *
   * @memberof TopNavDropdownHelpComponent
   */
  @Output()
  readonly close = new EventEmitter();

  /**
   * Gets url for help page
   *
   * @type {string}
   * @memberof TopNavDropdownHelpComponent
   */
  @Input()  helpUrl: string;

  /**
   * Gets url for Support page
   *
   * @type {string}
   * @memberof TopNavDropdownHelpComponent
   */
    @Input()  supportUrl: string;

}
