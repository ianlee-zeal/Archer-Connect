import { Document } from '@app/models/documents';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

import { EntityTypeEnum } from '@app/models/enums/entity-type.enum';
import { PermissionService, ToastService } from '@app/services';
import { UrlHelper } from '@app/helpers/url-helper';
import * as fromShared from '@shared/state/common.actions';
import * as fromSharedSelectors from '@shared/state/index';
import { RelatedPage } from '@app/modules/shared/grid-pager/related-page.enum';
import { PermissionTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as projectsActions from '@app/modules/projects/state/actions';
import { ProjectCommunicationRecord } from '@app/models/communication-center/project-communication-record';
import { filter, takeUntil } from 'rxjs/operators';
import { notesListSelectors } from '@app/modules/shared/state/notes-list/selectors';
import * as notesListActions from '@app/modules/shared/state/notes-list/actions';
import { Note } from '@app/models';
import { UntypedFormGroup } from '@angular/forms';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { ClaimantsState } from '../../../claimants/state/reducer';
import * as actions from '../../communication/state/actions';
import { communicationSelectors } from '../../communication/state/selectors';
import { ProjectsCommunicationDetailsComponent } from '../projects-communication-details/projects-communication-details.component';

@Component({
  selector: 'app-projects-communication-create-page',
  templateUrl: './projects-communication-create-page.component.html',
  styleUrls: ['./projects-communication-create-page.component.scss'],
})
export class ProjectsCommunicationCreatePageComponent extends Editable implements OnInit, OnDestroy {
  @ViewChild(ProjectsCommunicationDetailsComponent) projectsCommunicationDetailsComponent : ProjectsCommunicationDetailsComponent;

  public currentCommunicationRecord$ = this.store.select(communicationSelectors.currentCommunicationRecord);
  public communicationActionBar$ = this.store.select(communicationSelectors.actionBar);
  public documents$ = this.store.select(fromSharedSelectors.sharedSelectors.documentsListSelectors.documents);
  public readonly note$ = this.store.select(notesListSelectors.editableNote);

  private ngUnsubscribe$ = new Subject<void>();

  public canEdit: boolean = true;
  private parentId: number;
  private note: Note;
  private relatedDocuments: Document[] = [];

  public actionBar: ActionHandlersMap = {
    back: {
      callback: () => this.goBack(),
      disabled: () => !this.canLeave,
    },
    save: {
      callback: () => this.save(),
      disabled: () => false,
      awaitedActionTypes: [
        actions.SaveCommunicationRecordSuccess.type,
        fromShared.FormInvalid.type,
        actions.Error.type,
      ],
    },
    cancel: () => this.goBack(),
  };

  private get canReadNotes(): boolean {
    return this.permissionService.canRead(PermissionTypeEnum.CommunicationNotes);
  }

  constructor(
    private store: Store<ClaimantsState>,
    private router: Router,
    private toaster: ToastService,
    private readonly permissionService: PermissionService,
  ) {
    super();
  }

  get hasChanges(): boolean {
    if (!this.projectsCommunicationDetailsComponent) {
      return false;
    }

    return this.projectsCommunicationDetailsComponent.validationForm.dirty;
  }

  protected get validationForm(): UntypedFormGroup {
    return null;
  }

  ngOnInit() {
    this.documents$
      .pipe(
        filter(documents => !!documents),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(documents => {
        this.relatedDocuments = documents;
      });

    this.communicationActionBar$
      .pipe(
        filter(actionBar => !!actionBar),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(actionBar => {
        this.store.dispatch(projectsActions.UpdateActionBar({
          actionBar: {
            ...this.actionBar,
            ...actionBar,
          },
        }));
      });

    this.note$.pipe(
      filter(note => !!note),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(note => {
      this.note = note;
    });

    this.parentId = +UrlHelper.getParent(this.router.url, '/overview');

    this.store.dispatch(projectsActions.UpdateActionBar({ actionBar: this.actionBar }));
    this.store.dispatch(fromShared.UpdatePager({ pager: { relatedPage: RelatedPage.ProjectCommunications, isForceDefaultBackNav: false } }));

    this.store.dispatch(actions.CreateNewCommunicationRecord());
  }

  protected save(): void {
    if (this.projectsCommunicationDetailsComponent.validate()) {
      const { sentiment, callerName } = this.projectsCommunicationDetailsComponent.formGroup.controls;

      const communication = ProjectCommunicationRecord.fromFormValue(
        EntityTypeEnum.Projects,
        this.parentId,
        {
          ...this.projectsCommunicationDetailsComponent.formGroup.value,
          sentiment: sentiment.value,
          callerName: callerName.value,
        },
      );

      const relatedDocuments = this.relatedDocuments.map(r => ({ ...r, ...{ id: 0 } }));

      this.store.dispatch(actions.SaveProjectCommunicationRecordRequest({
        entityId: this.parentId,
        projectCommunicationRecord: {
          ...communication,
          notes: this.note ? [Note.toDto(this.note)] : [],
          relatedDocuments,
        },
        canReadNotes: this.canReadNotes,
        entity: GridId.Projects,
        callback: () => this.saveCompleted(),
      }));
    } else {
      this.store.dispatch(fromShared.FormInvalid());
      this.toaster.showWarning('Form is not valid', 'Cannot save');
    }
  }

  private saveCompleted() {
    this.projectsCommunicationDetailsComponent.validationForm.markAsPristine();
  }

  private goBack(): void {
    this.store.dispatch(fromShared.GotoParentView());
  }

  public ngOnDestroy(): void {
    this.store.dispatch(notesListActions.CloseEditMode());
    this.store.dispatch(fromSharedSelectors.sharedActions.documentsListActions.ClearDocuments());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
