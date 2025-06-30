import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-step-tracker-badge',
  templateUrl: './step-tracker-badge.component.html',
  styleUrl: './step-tracker-badge.component.scss'
})
export class StepTrackerBadgeComponent {
  @Input() step: number;
  @Input() totalSteps: number;

  private readonly RADIUS: number = 21;
  private readonly CIRCUMFERENCE: number = 2 * Math.PI * this.RADIUS;

  get circleOffset(): string {
    var percentComplete = (this.step / this.totalSteps) * 100;
    const scaledPercent = percentComplete * 0.97;
    const offset = this.CIRCUMFERENCE - (scaledPercent / 100) * this.CIRCUMFERENCE;
    return offset.toString();
  }
}