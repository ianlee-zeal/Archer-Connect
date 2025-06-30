import { Component, OnDestroy, OnInit } from '@angular/core';

import { PowerBiConfigService } from '@app/services/api/power-bi-config.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PowerBiConfigModel, PowerBIEndpoints } from '@app/services/power-bi-config.model';

@Component({
  selector: 'app-tort-dashboard',
  templateUrl: './tort-dashboard.component.html',
  styleUrls: ['./tort-dashboard.component.scss'],
})
export class TortDashboardComponent implements OnInit, OnDestroy {

  tortPowerBiConfig$: Observable<PowerBiConfigModel>;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private powerBiConfigService: PowerBiConfigService
  ) { }

  ngOnInit(): void {
    this.tortPowerBiConfig$ = this.powerBiConfigService.getEmbeddedReportSettings(PowerBIEndpoints.TALC_TORT_DASHBOARD).pipe(
      takeUntil(this.unsubscribe$)
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
