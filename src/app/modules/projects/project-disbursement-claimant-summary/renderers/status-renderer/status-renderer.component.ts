import { Component } from '@angular/core';

import { IconHelper } from '@app/helpers';
import { BaseCellRendererComponent } from '@app/modules/shared/_abstractions/base-cell-renderer';

/**
 * Component for rendering of lien stage information
 *
 * @export
 * @class StatusRendererComponent
 * @extends {BaseCellRendererComponent}
 */
@Component({
  selector: 'app-status-renderer',
  templateUrl: './status-renderer.component.html',
  styleUrls: ['./status-renderer.component.scss'],
})
export class StatusRendererComponent extends BaseCellRendererComponent {
  /**
   * Returns relative path to the stage icon
   *
   * @param {string} stage - current stage
   * @returns {string}
   * @memberof StatusRendererComponent
   */
  getIcon(stage: string): string {
    return IconHelper.getClaimantSummaryStatusIcon(stage);
  }

  getText(stage: string): string {
    return IconHelper.getClaimantSummaryStatusIconText(stage);
  }
}
