import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { sharedSelectors, sharedActions } from '@app/modules/shared/state';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { takeUntil } from 'rxjs/operators';
import { Note } from '@app/models/note';
import { PermissionService } from '@app/services';
import { NEW_ID } from '@app/helpers/constants';
import { GotoParentView } from '../state/common.actions';
import { ActionHandlersMap } from '../action-bar/action-handlers-map';
import { SharedState } from '../state/common.reducer';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
})
export class NotesComponent implements OnInit, OnDestroy {
  @Input() entityTypeId: EntityTypeEnum;
  @Input() additionalEntityTypeIds: EntityTypeEnum[] = [];
  @Input() entityId: number;
  @Input() pageSize = 20;
  @Input() isPublicSettingEnabled = false;
  @Input() isEditEnabled = true;
  @Output() readonly actionBarUpdated: EventEmitter<ActionHandlersMap> = new EventEmitter();
  @Output() readonly notesEditModeChanged: EventEmitter<boolean> = new EventEmitter();
  @Output() readonly notesExpanded: EventEmitter<boolean> = new EventEmitter();

  private editableNote$ = this.store.select(sharedSelectors.notesListSelectors.editableNote);
  private editableNote: Note;
  private isEditMode$ = this.store.select(sharedSelectors.notesListSelectors.isEditMode);
  public isAllNotesExpanded$ = this.store.select(sharedSelectors.notesListSelectors.isAllNotesExpanded);
  private isAllNotesExpanded: boolean;

  public hasChanges$ = this.store.select(sharedSelectors.notesListSelectors.hasChanges);
  private hasChanges: boolean;

  private isEditMode: boolean;
  private ngUnsubscribe$ = new Subject<void>();

  private readonly actionBar: ActionHandlersMap = {
    back: () => this.back(),
    new: {
      callback: () => this.addNew(),
      disabled: () => this.isEditMode,
      hidden: () => this.isEditMode || !this.isEditEnabled,
      permissions: PermissionService.create(PermissionTypeEnum.ClientNotes, PermissionActionTypeEnum.Create),
    },
    save: {
      callback: () => this.save(),
      hidden: () => !this.isEditMode,
      disabled: () => !this.hasChanges,
      awaitedActionTypes: [
        sharedActions.notesListActions.CloseEditMode.type,
        sharedActions.notesListActions.UpdateNoteError.type,
        sharedActions.notesListActions.CreateNewNoteError.type,
        sharedActions.notesListActions.SaveEditableNoteError.type,
      ],
    },
    cancel: {
      callback: () => this.cancel(),
      hidden: () => !this.isEditMode,
    },
    expandNotes: {
      callback: () => this.toggleExpanded(true),
      hidden: () => this.isAllNotesExpanded,
    },
    collapseNotes: {
      callback: () => this.toggleExpanded(false),
      hidden: () => !this.isAllNotesExpanded,
    },
  };

  constructor(
    private readonly store: Store<SharedState>,
  ) { }

  public ngOnInit(): void {
    this.actionBarUpdated.emit(this.actionBar);

    this.hasChanges$.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((hasChanges: boolean) => {
        this.hasChanges = hasChanges;
      });

    this.isEditMode$.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((isEditMode: boolean) => {
        this.isEditMode = isEditMode;
        this.notesEditModeChanged.emit(this.isEditMode);
      });

    this.isAllNotesExpanded$.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(value => {
        this.isAllNotesExpanded = value;
        this.notesExpanded.emit(this.isAllNotesExpanded);
      });

    this.editableNote$.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((note: Note) => {
        this.editableNote = note;
      });
  }

  private back(): void {
    this.store.dispatch(GotoParentView());
  }

  public addNew(): void {
    this.store.dispatch(sharedActions.notesListActions.AddNewNote({
      note: {
        entityId: this.entityId,
        entityTypeId: this.entityTypeId,
        html: '',
        isPublic: false,
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

  public ngOnDestroy(): void {
    if (this.isEditMode && this.entityId !== NEW_ID && this.editableNote?.id) {
      this.cancel();
    }
    this.actionBarUpdated.emit(null);
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
