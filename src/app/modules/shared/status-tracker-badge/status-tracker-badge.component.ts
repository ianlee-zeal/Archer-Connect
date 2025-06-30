import { Component, Input, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { LienServiceStatus } from '@app/models/enums';

@Component({
  selector: 'app-status-tracker-badge',
  templateUrl: './status-tracker-badge.component.html',
  styleUrls: ['./status-tracker-badge.component.scss'],
})
export class StatusTrackerBadgeComponent implements OnChanges {
  public imagePath: string = '';
  public iconPath: string = '';

  @Input() topText: string = '';
  @Input() bottomText: string = '';
  @Input() link: string = '';
  @Input() status: number;
  @Input() percentComplete?: number = null;

  protected showTracker: boolean = false;
  private readonly RADIUS: number = 21;
  private readonly CIRCUMFERENCE: number = 2 * Math.PI * this.RADIUS;

  constructor(
    private readonly router: Router,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.status || changes.percentComplete) {
      this.imagePath = this.getProgressImage();
      this.iconPath = this.getIcon();
    }
  }

  get circleOffset(): string {
    const scaledPercent = this.percentComplete * 0.97;
    const offset = this.CIRCUMFERENCE - (scaledPercent / 100) * this.CIRCUMFERENCE;
    return offset.toString();
  }

  private getProgressImage(): string {
    switch (this.status) {
      case LienServiceStatus.Pending:
        if(this.percentComplete > 0) {
          this.showTracker = true;
          return '';
        }
        return this.percentComplete == 0 ? 'assets/svg/progress-NA.svg' : 'assets/svg/progress-40.svg';
      case LienServiceStatus.Finalized:
        return 'assets/svg/progress-complete.svg';
      default:
        return 'assets/svg/progress-NA.svg';
    }
  }

  private getIcon(): string {
    switch (this.status) {
      case LienServiceStatus.Pending:
        return this.percentComplete == null ? 'assets/svg/substatus-inprogress.svg'
          : this.percentComplete > 0 ? 'assets/svg/substatus-inprogress.svg' : '';
      case LienServiceStatus.Finalized:
        return 'assets/svg/substatus-complete.svg';
      default:
        return '';
    }
  }

  @HostListener('click')
  onClick(): void {
    if (this.link) {
      this.router.navigate([this.link]);
    }
  }

  get cursorStyle(): string {
    return this.link ? 'pointer' : 'default';
  }
}
