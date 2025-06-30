import { Component, OnInit } from '@angular/core';
import { Project } from '@app/models';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ProjectsCommonState } from '../state/reducer';
import * as selectors from '../state/selectors';

@Component({
  selector: 'app-project-disbursement-payment-queue',
  templateUrl: './project-disbursement-payment-queue.component.html',
})
export class ProjectDisbursementPaymentQueueComponent implements OnInit {
  public readonly project$ = this.store.select(selectors.item);
  private readonly ngUnsubscribe$ = new Subject<void>();

  currentProject: Project;
  constructor(
    private readonly store: Store<ProjectsCommonState>,

  ) { }
  ngOnInit(): void {
    this.subscribeCurrentProject();
  }

  private subscribeCurrentProject(): void {
    this.project$
      .pipe(
        filter(project => !!project),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((project: Project) => {
        this.currentProject = project;
      });
  }
}
