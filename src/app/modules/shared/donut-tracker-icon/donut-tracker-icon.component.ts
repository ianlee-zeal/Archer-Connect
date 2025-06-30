import { Component, Input } from '@angular/core';
import { LienServiceStatus } from '@app/models/enums';

const RADIUS: number = 45;
const CIRCUMFERENCE: number = 2 * Math.PI * RADIUS;

@Component({
  selector: 'app-donut-tracker-icon',
  templateUrl: './donut-tracker-icon.component.html',
  styleUrls: ['./donut-tracker-icon.component.scss'],
})
export class DonutTrackerIconComponent {

  @Input() percentComplete: number;
  @Input() status: LienServiceStatus;
  @Input() iconSrc: string;

  get circleOffset(): string {
    const scaledPercent = this.percentComplete * 0.97;
    const offset = CIRCUMFERENCE - (scaledPercent / 100) * CIRCUMFERENCE;
    return offset.toString();
  }

  LienServiceStatus = LienServiceStatus;

}
