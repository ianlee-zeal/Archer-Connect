import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rating-icon',
  templateUrl: './rating-icon.component.html',
  styleUrls: ['./rating-icon.component.scss'],
})
export class RatingIconComponent {
  @Input() public iconClass: string;
}
