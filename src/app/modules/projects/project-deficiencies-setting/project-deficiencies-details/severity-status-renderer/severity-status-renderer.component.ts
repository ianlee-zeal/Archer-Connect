import { Component } from '@angular/core';

import { BaseCellRendererComponent } from '@app/modules/shared/_abstractions/base-cell-renderer';
import { SeverityStatus } from '@app/models/enums/severity-status.enums';

/**
 * Component for rendering of lien stage information
 *
 * @export
 * @class LienStageRendererComponent
 * @extends {BaseCellRendererComponent}
 */
@Component({
  selector: 'app-severity-status-renderer',
  templateUrl: './severity-status-renderer.component.html',
  styleUrls: ['./severity-status-renderer.component.scss'],
})
export class SeverityStatusRendererComponent extends BaseCellRendererComponent {
  isSeverityWarning(): boolean {
    return this.params.data.severityStatus.id === SeverityStatus.Warning;
  }

  isSeverityError(): boolean {
    return this.params.data.severityStatus.id === SeverityStatus.Error;
  }
}
