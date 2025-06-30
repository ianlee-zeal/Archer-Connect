import { Component, OnDestroy, OnInit } from '@angular/core';
import { InfoCardState } from '@app/models/enums/info-card-state.enum';
import { ActionsSubject, Store } from '@ngrx/store';
import { ofType } from '@ngrx/effects';
import { projectDeficienciesCount } from '@app/modules/firm-landing-page/state/selectors';
import * as landingPageActions from '.././state/actions';
import { FirmLandingPageState } from '@app/modules/firm-landing-page/state/reducer';
import { ProjectDeficiencyCount } from '@app/models/project-deficiency-count';
import { filter, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { ExportLoadingStatus, JobNameEnum } from '@app/models/enums';
import { StringHelper } from '@app/helpers';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { Channel } from 'pusher-js';
import { PusherService } from '@app/services/pusher.service';
import * as exportsActions from '@shared/state/exports/actions';
import { exportsSelectors } from '@shared/state/exports/selectors';
import { DownloadGeneratedDocument } from '@app/modules/projects/state/actions';

@Component({
  selector: 'app-global-deficiencies',
  templateUrl: './global-deficiencies.component.html',
  styleUrl: './global-deficiencies.component.scss'
})
export class GlobalDeficienciesComponent implements OnInit, OnDestroy {

  public projectDeficienciesCount$ = this.store.select(projectDeficienciesCount);

  public projectDeficienciesList: ProjectDeficiencyCount[] = [];
  public projectDeficienciesListFiltered: ProjectDeficiencyCount[] = [];
  public searchText: string = '';
  public selectAll: boolean = false;

  protected channel: Channel;
  protected isExporting: boolean;
  public isDataLoading: boolean = true;

  private readonly ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store<FirmLandingPageState>,
    private readonly router: Router,
    private readonly pusher: PusherService,
    private readonly actionSubj: ActionsSubject,
    private readonly enumToArray: EnumToArrayPipe,
  ) {}

  ngOnInit() {
    this.store.dispatch(landingPageActions.GetGlobalDeficiencyCountsForProjects());
    this.projectDeficienciesCount$
      .pipe(filter(projectDeficienciesCount => !!projectDeficienciesCount), takeUntil(this.ngUnsubscribe$))
      .subscribe(projectDeficienciesCount => {
        this.projectDeficienciesList = projectDeficienciesCount;
        this.projectDeficienciesListFiltered = projectDeficienciesCount;
        this.isDataLoading = false;
    });

    this.store.select(exportsSelectors.isExporting).pipe(
          takeUntil(this.ngUnsubscribe$),
        ).subscribe((result: boolean) => { this.isExporting = result; });

    this.actionSubj.pipe(
      ofType(landingPageActions.GenerateReportsComplete),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe( () => {
      this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
    });

  }

  public get hasSelectedProjects(): boolean {
    return this.projectDeficienciesList?.some(project => project.checked) ?? false;
  }

  public filterProjects(searchText: string): void {
    this.projectDeficienciesListFiltered = this.projectDeficienciesList.filter(project => project.projectName?.toLowerCase().includes(searchText.toLowerCase()));
  }

  public clearSearch(): void {
    this.searchText = '';
    this.projectDeficienciesListFiltered = [...this.projectDeficienciesList];
  }

  public onSelectAllCheckboxChange(): void {
    this.selectAll = !this.selectAll;

    this.projectDeficienciesList.forEach(project => project.checked = this.selectAll);
  }

  public onClearAll(): void {
    this.selectAll = false;
    this.projectDeficienciesList.forEach(project => project.checked = false);
  }

  public onProjectCheckboxChange(item: ProjectDeficiencyCount): void {
    item.checked = !item.checked

    if (item.checked === false) {
      this.selectAll = false;
    }
    else if (item.checked === true) {
      var allChecked = this.projectDeficienciesList.every(project => project.checked);

      if (allChecked) {
        this.selectAll = true;
      }
    }
  }

  public onCardClick(projectId: number): void {
    this.router.navigate([`projects/${projectId}/portal-deficiencies/tabs/deficiencies-list`]);
  }

  public getSelectedCount(): number {
    return this.projectDeficienciesList.filter(project => project.checked).length;
  }

  public onGenerateReports(): void {
    const channelName = this.generateChannelName(JobNameEnum.GenerateProjectsDeficienciesReport);
    const selectedProjects = this.projectDeficienciesList.filter(project => project.checked);

    if (selectedProjects.length === 0) {
      return;
    }

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map(i => i.name),
      this.exportProjectsDeficienciesReportCallback.bind(this),
      () => {
        const projectIds = selectedProjects.map(project => project.projectId);
        this.store.dispatch(landingPageActions.GenerateReports({ projectIds, channelName}));
      }
    )

  }

  private exportProjectsDeficienciesReportCallback (data: any, event: string): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    switch (ExportLoadingStatus[event]) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(DownloadGeneratedDocument({ generatorId: data.id }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(landingPageActions.Error({ errorMessage: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
      }
    this.onClearAll();
    }

  private generateChannelName(jobName: JobNameEnum): string {
      const channelName = StringHelper.generateChannelName(jobName);
      this.cleanupChannelSubscription();
      return channelName;
    }

  private cleanupChannelSubscription() {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }
  }

  ngOnDestroy() {
    this.cleanupChannelSubscription();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  protected readonly InfoCardState = InfoCardState;
}
