import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ExpansionBarElement } from '@app/models';

@Component({
  selector: 'app-grid-expansion-panel-row',
  templateUrl: './grid-expansion-panel-row.component.html',
  styleUrls: ['./grid-expansion-panel-row.component.scss'],
})
export class GridExpansionPanelRowComponent {
  @Input() isExpanded;
  @Input() elements: ExpansionBarElement[];
  @Input() width: string;
  @Input('class') class: string;

  @Output() expanded = new EventEmitter<boolean>();

  trackByFn = (index: number): number => index;

  public toggle(): void {
    this.isExpanded = !this.isExpanded;
    this.expanded.emit(this.isExpanded);
  }
}
