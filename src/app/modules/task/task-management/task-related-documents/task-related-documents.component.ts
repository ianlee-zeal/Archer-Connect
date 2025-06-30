import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';

import { EntityTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { DocumentsListComponent } from '@app/modules/shared/documents-list/documents-list.component';
import { ofType } from '@ngrx/effects';
import * as taskDetailsTemplateActions from '@app/modules/shared/state/task-details-template/actions';
import { ClaimantsState } from '../../../claimants/state/reducer';
import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';

@Component({
  selector: 'app-task-related-documents',
  templateUrl: './task-related-documents.component.html',
  styleUrls: ['./task-related-documents.component.scss'],
})
export class TaskRelatedDocumentsComponent implements OnInit, OnDestroy {
  public readonly entityType = EntityTypeEnum.Tasks;
  public readonly gridId: GridId = GridId.TaskRelatedDocuments;
  public taskId: number;

  public taskDetails$ = this.store.select(selectors.taskDetails);

  private ngUnsubscribe$ = new Subject<void>();
  public additionalInfo: { [key: number]: string } = {};
  public additionalInfoLoaded: boolean = false;

  public enabledAutoHeight: boolean = false;
  public skipSetContentHeight: boolean = true;
  public isContentAutoHeight: boolean = true;

  @ViewChild(DocumentsListComponent) docListComponent: DocumentsListComponent;

  constructor(
    private store: Store<ClaimantsState>,
    private readonly route: ActivatedRoute,
    private readonly actionsSubject: ActionsSubject,
  ) { }

  ngOnInit(): void {
    this.taskId = this.route.parent.parent.snapshot.params.id;

    if (this.taskId) {
      this.taskDetails$
        .pipe(
          filter(task => !!task),
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe(task => {
          if (task?.subTasks?.length) {
            task.subTasks.forEach(st => {
              this.additionalInfo[st.id] = st.name;
            });
          }
          this.additionalInfoLoaded = true;
        });

      this.store.dispatch(actions.GetTaskDetails({ taskId: this.taskId }));
    }

    this.actionsSubject
      .pipe(
        ofType(
          actions.CreateTaskComplete,
          actions.UpdateTaskComplete,
          taskDetailsTemplateActions.CreateSubTaskComplete,
          taskDetailsTemplateActions.UpdateSubTaskComplete,
        ),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(() => {
        this.docListComponent.redraw();
      });
  }

  public ngOnDestroy(): void {
    this.additionalInfoLoaded = false;
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
