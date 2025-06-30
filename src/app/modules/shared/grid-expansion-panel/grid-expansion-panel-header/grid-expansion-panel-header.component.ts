import { Component, Input } from '@angular/core';

import { ExpansionBarElement } from '@app/models';

@Component({
  selector: 'app-grid-expansion-panel-header',
  templateUrl: './grid-expansion-panel-header.component.html',
  styleUrls: ['./grid-expansion-panel-header.component.scss'],
})
export class GridExpansionPanelHeaderComponent {
  @Input() elements: ExpansionBarElement[];
  @Input() width: string;
}
