import { Component, OnInit } from '@angular/core';
import { Project } from '@app/models';
import { GridId } from '@app/models/enums/grid-id.enum';
import { loadingInProgress } from '@app/state';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ProjectsCommonState } from '../state/reducer';
import * as selectors from '../state/selectors';

@Component({
  selector: 'app-project-disbursement-closing-statement',
  templateUrl: './project-disbursement-closing-statement.component.html',
  styleUrls: ['./project-disbursement-closing-statement.component.scss'],
})
export class ProjectDisbursementClosingStatementComponent implements OnInit {
  public readonly project$ = this.store.select(selectors.item);
  public readonly loadingInProgress$ = this.store.select(loadingInProgress);
  public gridId: GridId = GridId.ProjectDisbursementClosingStatement;
  private readonly ngUnsubscribe$ = new Subject<void>();

  currentProject: Project;
  constructor(
    private readonly store: Store<ProjectsCommonState>,
  ) {}

  ngOnInit(): void {
    this.subscribeCurrentProject();
  }

  private subscribeCurrentProject(): void {
    this.project$
      .pipe(
        filter(project => !!project),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((project: Project) => {
        this.currentProject = project;
      });
  }
}
