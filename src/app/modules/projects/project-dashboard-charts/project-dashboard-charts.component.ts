import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LienStatusSummary } from '@app/models';
import { ProductCategory, ProductCategoryValues } from '@app/models/enums';

@Component({
  selector: 'app-project-dashboard-charts',
  templateUrl: './project-dashboard-charts.component.html',
  styleUrl: './project-dashboard-charts.component.scss'
})
export class ProjectDashboardChartsComponent {
  @Input() projectId: number;
  @Input() service: ProductCategory;
  @Input() lienStatusSummary: LienStatusSummary;
  @Output() public outsideClick = new EventEmitter<void>();

  public readonly ProductCategory = ProductCategory;
  public readonly ProductCategoryValues = ProductCategoryValues;

  constructor(
    private readonly router: Router,
    private readonly eRef: ElementRef,
  ) {}

  goToService(service: ProductCategory): void {
    if (service === this.ProductCategory.QSFAdministration) {
      this.router.navigate([`/projects/${this.projectId}/payments/tabs/dashboard`]);
    } else {
      this.router.navigate([`/projects/${this.projectId}/services/${service}`]);
    }
  }

  @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent): void {
      if (!this.eRef.nativeElement.contains(event.target)) {
        this.outsideClick.emit();
      }
    }
}
