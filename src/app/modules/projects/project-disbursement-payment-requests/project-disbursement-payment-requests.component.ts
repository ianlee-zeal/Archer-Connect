import { Component, OnInit } from '@angular/core';
import { Project } from '@app/models';
import { loadingInProgress } from '@app/state';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ProjectsCommonState } from '../state/reducer';
import * as selectors from '../state/selectors';

@Component({
  selector: 'app-project-disbursement-payment-requests',
  templateUrl: './project-disbursement-payment-requests.component.html',
  styleUrls: ['./project-disbursement-payment-requests.component.scss'],
})
export class ProjectDisbursementPaymentRequestsComponent implements OnInit {
  public readonly project$ = this.store.select(selectors.item);
  public readonly loadingInProgress$ = this.store.select(loadingInProgress);
  public newRequestOpened: boolean = false;

  private readonly ngUnsubscribe$ = new Subject<void>();

  project: Project;
  constructor(
    private readonly store: Store<ProjectsCommonState>,
  ) {}

  ngOnInit(): void {
    this.subscribeCurrentProject();
  }

  public onNewRequestOpened(): void {
    this.newRequestOpened = true;
  }

  onRequestCancelled(): void {
    this.newRequestOpened = false;
  }

  private subscribeCurrentProject(): void {
    this.project$
      .pipe(
        filter(project => !!project),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((project: Project) => {
        this.project = project;
      });
  }
}
