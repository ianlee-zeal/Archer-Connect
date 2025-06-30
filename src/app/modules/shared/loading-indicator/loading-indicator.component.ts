import { Component, AfterViewInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { SideNavMenuService } from '@app/services';

import { LoadingIndicatorService } from '@app/services/loading-indicator.service';

@Component({
  selector: 'app-loading-indicator',
  templateUrl: './loading-indicator.component.html',
  styleUrls: ['./loading-indicator.component.scss'],
})
export class LoadingIndicatorComponent implements AfterViewInit, OnDestroy {
  public isBusy = false;
  public subscription = null;

  @Input()
    loadingInProgress = false;
  @Input() loadingIndicatorInPage = false;

  constructor(
    private loadingIndicatorSvc: LoadingIndicatorService,
    private navService: SideNavMenuService,
    private cd: ChangeDetectorRef,
  ) {}

  public get isSideMenuExpanded(): boolean {
    return this.navService.isExpanded;
  }

  public ngAfterViewInit(): void {
    this.subscription = this.loadingIndicatorSvc.stateChanged
      .subscribe((value: boolean) => {
        if (this.isBusy !== value) {
          this.isBusy = value;
        }
        this.cd.detectChanges();
      });
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
