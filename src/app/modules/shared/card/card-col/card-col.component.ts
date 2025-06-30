import { Component, Input, ContentChildren, QueryList, AfterContentInit } from '@angular/core';

import { CardRowComponent } from '../card-row/card-row.component';

@Component({
  selector: 'card-col',
  templateUrl: './card-col.component.html',
  styleUrls: ['./card-col.component.scss'],
  host: { '[style.width]': "!width ? '100%' : 'null'" },
})
export class CardColComponent implements AfterContentInit {
  @ContentChildren(CardRowComponent, { descendants: true }) public rowChildren: QueryList<CardRowComponent>;

  @Input() public width: number;
  @Input() public minWidth: number;
  @Input() public labelWidth: number;

  public ngAfterContentInit(): void {
    if (!this.labelWidth) {
      return;
    }

    this.rowChildren.forEach(row => {
      const labelWidth = +this.labelWidth;
      const containerWidth = +this.width;

      if (!isNaN(labelWidth)) {
        row.labelWidth = labelWidth;
        row.containerWidth = containerWidth;
      }
    });
  }
}
