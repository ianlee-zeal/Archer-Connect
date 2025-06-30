import { Component } from '@angular/core';

import { IconHelper } from '@app/helpers';
import { BaseCellRendererComponent } from '@app/modules/shared/_abstractions/base-cell-renderer';

/**
 * Component for rendering of SPI status information
 *
 * @export
 * @class SPIStatusRendererComponent
 * @extends {BaseCellRendererComponent}
 */
@Component({
  selector: 'app-spi-status-renderer',
  templateUrl: './spi-status-renderer.component.html',
  styleUrls: ['./spi-status-renderer.component.scss'],
})
export class SPIStatusRendererComponent extends BaseCellRendererComponent {
  /**
   * Returns relative path to status icon
   *
   * @param {boolean} status - current status
   * @returns {string}
   * @memberof SPIStatusRendererComponent
   */
  getIcon(status: boolean): string {
    return IconHelper.getSPIStatusIcon(status);
  }
}
