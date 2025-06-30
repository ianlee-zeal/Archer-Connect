import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge-pill',
  templateUrl: './badge-pill.component.html',
  styleUrls: ['./badge-pill.component.scss'],
})
export class BadgePillComponent {
  @Input() public type: string;
  @Input() public text: string;
}
