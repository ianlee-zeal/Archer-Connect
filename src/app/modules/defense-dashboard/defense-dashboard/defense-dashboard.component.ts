import { Component, OnDestroy, OnInit } from '@angular/core';

import { PowerBiConfigService } from '@app/services/api/power-bi-config.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PowerBiConfigModel, PowerBIEndpoints } from '@app/services/power-bi-config.model';

@Component({
  selector: 'app-defense-dashboard',
  templateUrl: './defense-dashboard.component.html',
  styleUrls: ['./defense-dashboard.component.scss'],
})
export class DefenseDashboardComponent implements OnInit, OnDestroy {

  defensePowerBiConfig$: Observable<PowerBiConfigModel>;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private powerBiConfigService: PowerBiConfigService
  ) { }

  ngOnInit(): void {
    this.defensePowerBiConfig$ = this.powerBiConfigService.getEmbeddedReportSettings(PowerBIEndpoints.TALC_DEFENSE_DASHBOARD).pipe(
      takeUntil(this.unsubscribe$)
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
