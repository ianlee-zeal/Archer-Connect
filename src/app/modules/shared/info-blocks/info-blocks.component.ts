import { Component, Input } from '@angular/core';
import { DashboardValueType, InfoBlockItem } from '@app/models';

/**
 * Component for showing blocks with some information for provided entity
 *
 * @export
 * @class InfoBlocksComponent
 */
@Component({
  selector: 'app-info-blocks',
  templateUrl: './info-blocks.component.html',
  styleUrls: ['./info-blocks.component.scss'],
})
export class InfoBlocksComponent {
  /**
   * Gets or sets array of data blocks
   *
   * @type {InfoBlockItem[]}
   * @memberof InfoBlocksComponent
   */
  public dashboardValueType = DashboardValueType;

  @Input()
  data: InfoBlockItem[];
}
