import { Component } from '@angular/core';

import { IconHelper } from '@app/helpers';
import { BaseCellRendererComponent } from '@app/modules/shared/_abstractions/base-cell-renderer';
import { Stage } from '@app/models/stage';

/**
 * Component for rendering of lien stage information
 *
 * @export
 * @class LienStageRendererComponent
 * @extends {BaseCellRendererComponent}
 */
@Component({
  selector: 'app-lien-stage-renderer',
  templateUrl: './lien-stage-renderer.component.html',
  styleUrls: ['./lien-stage-renderer.component.scss'],
})
export class LienStageRendererComponent extends BaseCellRendererComponent {
  /**
   * Returns relative path to the stage icon
   *
   * @param {Stage} stage - current lien stage
   * @returns {string}
   * @memberof LienStageRendererComponent
   */
  getIcon(stage: Stage): string {
    return IconHelper.getLienStageIcon(stage);
  }
}
