import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntityTypeEnum } from '@app/models/enums/entity-type.enum';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { sharedSelectors, sharedActions } from '@app/modules/shared/state';
import { Note } from '@app/models/note';
import { UserAccessPoliciesOrgsState } from '@app/modules/admin/user-access-policies/orgs/state/reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { NEW_ID } from '@app/helpers/constants';
import { communicationSelectors } from '../state/selectors';
import { UpdateCommunicationDetailsActionBar } from '../state/actions';

@Component({
  selector: 'app-communication-notes-page',
  templateUrl: './communication-notes-page.component.html',
  styleUrls: ['./communication-notes-page.component.scss'],
})
export class CommunicationNotesPageComponent implements OnInit, OnDestroy {
  public entityTypeId = EntityTypeEnum.Communications;
  public entityId: number;
  public entityLabel: string;
  private isEditMode: boolean;
  public isAllNotesExpanded: boolean;
  public notesEditModeChanged: boolean = false;
  public notesExpanded: boolean = false;
  public id: number;
  public canEdit = true;
  public isEditEnabled = true;

  public communication$ = this.store.select(communicationSelectors.currentCommunicationRecord);
  private isEditMode$ = this.store.select(sharedSelectors.notesListSelectors.isEditMode);
  public isAllNotesExpanded$ = this.store.select(sharedSelectors.notesListSelectors.isAllNotesExpanded);

  private ngUnsubscribe$ = new Subject<void>();

  notesActionBar: ActionHandlersMap;

  private get isNewRecord(): boolean {
    return this.id === NEW_ID;
  }

  private actionBar: ActionHandlersMap = {
    new: {
      callback: () => this.addNew(),
      disabled: () => this.isEditMode,
      permissions: PermissionService.create(PermissionTypeEnum.CommunicationNotes, PermissionActionTypeEnum.Create),
    },
    saveNote: {
      callback: () => this.save(),
      hidden: () => !this.isEditMode || this.isNewRecord,
      awaitedActionTypes: [
        sharedActions.notesListActions.CloseEditMode.type,
        sharedActions.notesListActions.UpdateNoteError.type,
        sharedActions.notesListActions.CreateNewNoteError.type,
        sharedActions.notesListActions.SaveEditableNoteError.type,
      ],
    },
    cancelNote: {
      callback: () => this.cancel(),
      hidden: () => !this.isEditMode,
    },
    expandNotes: {
      callback: () => this.toggleExpanded(true),
      hidden: () => this.isAllNotesExpanded || this.isNewRecord,
    },
    collapseNotes: {
      callback: () => this.toggleExpanded(false),
      hidden: () => !this.isAllNotesExpanded || this.isNewRecord,
    },
  };

  constructor(
    private store: Store<UserAccessPoliciesOrgsState>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  public ngOnInit(): void {
    this.entityId = +this.activatedRoute.snapshot.parent.params.id || 0;

    this.entityLabel = this.router.url.split('/')[1];

    // Do not show Notes Action Bar for Create Claimant Communication page.
    if (this.entityId || this.entityLabel === 'projects') {
      this.store.dispatch(UpdateCommunicationDetailsActionBar({ actionBar: this.actionBar }));

      this.isEditMode$.pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe((isEditMode: boolean) => {
          this.isEditMode = isEditMode;
        });

      this.isAllNotesExpanded$.pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe(value => {
          this.isAllNotesExpanded = value;
        });
    }

    this.entityId = +this.activatedRoute.snapshot.parent.params.id || 0;

    this.communication$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(communication => { this.id = communication?.id || NEW_ID; });
  }

  public addNew(): void {
    this.store.dispatch(sharedActions.notesListActions.AddNewNote({
      note: {
        entityId: this.id,
        entityTypeId: this.entityTypeId,
        html: '',
      } as Note,
    }));
  }

  private save(): void {
    this.store.dispatch(sharedActions.notesListActions.SaveEditableNote());
  }

  private cancel(): void {
    this.store.dispatch(sharedActions.notesListActions.CloseEditMode());
  }

  private toggleExpanded(value: boolean): void {
    this.store.dispatch(sharedActions.notesListActions.ExpandAllNotes({ expand: value }));
  }

  public onActionBarUpdated(actionBar: ActionHandlersMap) {
    if (!actionBar) {
      return;
    }
    this.notesActionBar = {
      ...actionBar,
      back: null,
      new: {
        ...actionBar.new,
        hidden: () => !this.isEditEnabled || !this.canEdit || this.notesEditModeChanged,
      },
      save: {
        ...actionBar.save,
        hidden: () => !this.notesEditModeChanged || this.isNewRecord,
      },
      expandNotes: {
        ...actionBar.expandNotes,
        hidden: () => this.notesExpanded || this.isNewRecord,
      },
      collapseNotes: {
        ...actionBar.collapseNotes,
        hidden: () => !this.notesExpanded || this.isNewRecord,
      },
    };
  }

  public onNotesEditModeChanged(isEdit: boolean) {
    this.notesEditModeChanged = isEdit;
  }

  public onNotesExpanded(isExpanded: boolean) {
    this.notesExpanded = isExpanded;
  }

  public ngOnDestroy(): void {
    this.canEdit = false;
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
