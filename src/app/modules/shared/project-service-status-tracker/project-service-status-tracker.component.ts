import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import { LienStatusSummary } from '@app/models';
import { LienServiceStatus, ProductCategory, ProductCategoryValues } from '@app/models/enums';

@Component({
  selector: 'app-project-service-status-tracker',
  templateUrl: './project-service-status-tracker.component.html',
  styleUrls: ['./project-service-status-tracker.component.scss'],
})
export class ProjectServiceStatusTrackerComponent implements OnInit {

  @Input() service: ProductCategory;
  @Input() lienStatusSummary: LienStatusSummary;
  @Input() isSelected: boolean = false;
  @Output() selected = new EventEmitter<void>();
  @Input() parentSelected: boolean = false;


  public serviceName: string;
  public iconSrc: string;
  public status: number;

  ngOnInit(): void {
    this.status = this.statusTracker();
    this.serviceName = ProductCategoryValues[this.service];
    this.iconSrc = this.getIcon();
  }

  onClick(): void {
    if (this.lienStatusSummary.isEngaged) {
      this.selected.emit();
    }
  }

  private statusTracker(): LienServiceStatus {
    if (this.lienStatusSummary.isEngaged) {
      if (this.lienStatusSummary.percentComplete == 100) {
        return LienServiceStatus.Finalized;
     } else {
        return LienServiceStatus.Pending;
     }
    } else {
      return LienServiceStatus.NotEngaged;
    }
  }

  private getIcon(): string {
    switch (this.service) {
      case ProductCategory.Release:
        return "assets/images/Release.svg";
      case ProductCategory.MedicalLiens:
        return "assets/images/Lien Resolution.svg";
      case ProductCategory.Bankruptcy:
        return "assets/images/Bankruptcy.svg";
      case ProductCategory.Probate:
        return "assets/images/Probate.svg";
      case ProductCategory.QSFAdministration:
        return "assets/images/Payments.svg";
    }
  }

  LienServiceStatus = LienServiceStatus;

}
