import { Component, EventEmitter, Output, Input, ChangeDetectionStrategy } from '@angular/core';
import { IconHelper } from '@app/helpers';
import { DataToggleState } from '@app/models/enums';

/**
 * Data toggle component (expand all \ collapse all)
 *
 * @export
 * @class DataToggleComponent
 */
@Component({
  selector: 'app-data-toggle',
  templateUrl: './data-toggle.component.html',
  styleUrls: ['./data-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataToggleComponent {
  /**
   * Available component state values
   *
   * @memberof DataToggleComponent
   */
  readonly states = DataToggleState;

  /**
   * Toggle event
   *
   * @memberof DataToggleComponent
   */
  @Output()
  readonly toggle = new EventEmitter<boolean>();

  /**
   * Gets or sets current data toggle state
   *
   * @memberof DataToggleComponent
   */
  @Input()
    state = DataToggleState.ExpandedAll;

  public get iconSrc(): string {
    return IconHelper.expandCollapseIcon(this.state);
  }

  public toggleBtn(): void {
    if (this.state === DataToggleState.ExpandedAll) {
      this.state = DataToggleState.CollapsedAll;
    } else if (this.state === DataToggleState.CollapsedAll) {
      this.state = DataToggleState.ExpandedAll;
    }
    this.toggle.emit(this.state === DataToggleState.CollapsedAll);
  }
}
