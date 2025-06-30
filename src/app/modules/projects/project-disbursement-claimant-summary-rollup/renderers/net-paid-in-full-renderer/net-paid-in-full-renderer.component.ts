import { Component } from '@angular/core';

import { IconHelper } from '@app/helpers';
import { BaseCellRendererComponent } from '@app/modules/shared/_abstractions/base-cell-renderer';

/**
 * Component for rendering of Net Paid in full
 *
 * @export
 * @class NetPaidInFullRendererComponent
 * @extends {BaseCellRendererComponent}
 */
@Component({
  selector: 'app-net-paid-in-full-renderer',
  templateUrl: './net-paid-in-full-renderer.component.html',
  styleUrls: ['./net-paid-in-full-renderer.component.scss'],
})
export class NetPaidInFullRendererComponent extends BaseCellRendererComponent {
  /**
   * Returns relative path to status icon
   *
   * @param {boolean | null} status - current status
   * @returns {string}
   * @memberof NetPaidInFullRendererComponent
   */
  getIcon(status: boolean): string {
    return IconHelper.getNetPaidInFullIcon(status);
  }
}
