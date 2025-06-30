import { Component } from '@angular/core';

import { IconHelper } from '@app/helpers';
import { BaseCellRendererComponent } from '@app/modules/shared/_abstractions/base-cell-renderer';

/**
 * Component for rendering of bankruptcy status information
 *
 * @export
 * @class StatusRendererComponent
 * @extends {BaseCellRendererComponent}
 */
@Component({
  selector: 'app-bk-status-renderer',
  templateUrl: './bk-status-renderer.component.html',
  styleUrls: ['./bk-status-renderer.component.scss'],
})
export class BankruptcyStatusRendererComponent extends BaseCellRendererComponent {
  /**
   * Returns relative path to the stage icon
   *
   * @param {string} stage - current stage
   * @returns {string}
   * @memberof StatusRendererComponent
   */
  getIcon(stage: number | string): string {
    if (!Number.isNaN(+stage)) {
      return IconHelper.getBankruptcyStatusIcon(+stage);
    } else {
      return IconHelper.getBankruptcyStatusIconByName(stage.toString());
    }
  }

  getText(stage: number | string): string {
    if (!Number.isNaN(+stage)) {
      return IconHelper.getBankruptcyStatusIconText(+stage);
    } else {
      return IconHelper.getBankruptcyStatusIconTextByName(stage.toString());
    }
  }
}
