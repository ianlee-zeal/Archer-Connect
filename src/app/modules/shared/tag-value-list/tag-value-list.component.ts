import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tag-value-list',
  templateUrl: './tag-value-list.component.html',
  styleUrls: ['./tag-value-list.component.scss'],
})
export class TagValueListComponent {
  @Input() public data: string[];
  @Input() public containerWidth: number;
}
