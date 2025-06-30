import { Component, Input } from '@angular/core';

import { ExpansionBarElement } from '@app/models';

@Component({
  selector: 'app-grid-expansion-panel-row-child',
  templateUrl: './grid-expansion-panel-row-child.component.html',
  styleUrls: ['./grid-expansion-panel-row-child.component.scss'],
})
export class GridExpansionPanelRowChildComponent {
  @Input() elements: ExpansionBarElement[];
  @Input() width: string;
  @Input() alternateBackground: boolean;
}
