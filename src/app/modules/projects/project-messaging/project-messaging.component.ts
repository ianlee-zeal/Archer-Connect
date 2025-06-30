import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { IdValue, Project } from '@app/models';
import { filter, takeUntil } from 'rxjs/operators';
import { ProjectMessage } from '@app/models/projects/project-message';
import { ProjectMessageType } from '@app/models/enums/project-message-type.enum';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import * as fromProjects from '../state';

@Component({
  selector: 'app-project-messaging',
  templateUrl: './project-messaging.component.html',
  styleUrls: ['./project-messaging.component.scss'],
})
export class ProjectMessagingComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  private project: Project;
  public projectMessages: ProjectMessage[];
  public canEdit: boolean = false;
  public hasChanges: boolean = false;
  public projectMessageType = ProjectMessageType;

  public project$ = this.store.select(selectors.item);
  public projectMessages$ = this.store.select(selectors.projectMessages);
  public projectMessagesModified$ = this.store.select(selectors.projectMessagesModified);
  public projectMessagesTypes$ = this.store.select(selectors.projectMessagesTypes);

  constructor(
    private readonly store: Store<fromProjects.AppState>,
  ) {}

  get projectId(): number | null {
    return this.project?.id;
  }

  ngOnInit(): void {
    this.updateActionBar();
    this.store.dispatch(actions.GetProjectMessagesTypesRequest());

    this.project$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(item => {
      this.project = item;
      this.store.dispatch(actions.GetProjectMessagesRequest({ projectId: this.project.id }));
    });

    this.projectMessages$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(item => {
      this.canEdit = false;
      this.projectMessages = item;
    });
  }

  onChange(messageType: IdValue, sectionIndex: number) {
    this.store.dispatch(actions.UpdateProjectMessageType({ messageType, sectionIndex }));
    this.hasChanges = true;
  }

  onChangeText(customMessage: string, sectionIndex: number) {
    this.store.dispatch(actions.UpdateProjectMessageText({ customMessage, sectionIndex }));
    this.hasChanges = true;
  }

  onSave() {
    this.store.dispatch(actions.SaveProjectMessages({ projectId: this.project.id }));
  }

  private updateActionBar(): void {
    this.store.dispatch(actions.UpdateActionBar({
      actionBar: {
        save: {
          callback: () => this.onSave(),
          hidden: () => !this.canEdit,
          disabled: () => !this.hasChanges,
        },
        cancel: {
          callback: () => {
            this.store.dispatch(actions.ResetProjectMessages());
            this.canEdit = false;
            this.hasChanges = false;
          },
          hidden: () => !this.canEdit,
        },
        edit: {
          permissions: PermissionService.create(PermissionTypeEnum.ProjectMessaging, PermissionActionTypeEnum.Edit),
          callback: () => {
            this.canEdit = true;
          },
        },
      },
    }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
