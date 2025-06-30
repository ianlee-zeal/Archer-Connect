import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { takeUntil, filter, debounceTime } from 'rxjs/operators';
import { Subject, combineLatest } from 'rxjs';

import { Note } from '@app/models/note';
import { UserInfo } from '@app/models';
import { QuillModule } from 'ngx-quill';

import { QuillEditorHelper } from '@app/helpers/quill-editor.helper';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { PermissionService } from '@app/services';
import { DocumentDataSourceEnum, EntityTypeEnum } from '@app/models/enums';
import { Policy } from '@app/modules/auth/policy';
import * as fromRootActions from '@app/state/root.actions';
import { ELASTIC_MAX_STRING_LENGTH } from '@app/helpers/constants';
import * as fromAuth from '../../../auth/state';
import * as fromShared from '../../state';

const { sharedActions, sharedSelectors } = fromShared;

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
})
export class NoteComponent implements OnInit, OnDestroy {
  @Input() public note: Note;
  @Input() isPublicSettingEnabled = false;
  @Input() isEditEnabled = true;

  public readonly isEditMode$ = this.store.select(sharedSelectors.notesListSelectors.isEditMode);
  public readonly editableNote$ = this.store.select(sharedSelectors.notesListSelectors.editableNote);
  public readonly loggedUser$ = this.store.select<object>(fromAuth.authSelectors.getUser);
  public readonly isAllNotesExpanded$ = this.store.select(sharedSelectors.notesListSelectors.isAllNotesExpanded);

  public readonly editorModules: QuillModule = QuillEditorHelper.modules;

  public isExpanded: boolean = true;
  public canEdit: boolean = true;
  public canDelete: boolean = true;
  private editableNote: Note = null;

  public hasPermissionToEdit: boolean;
  public hasPermissionToDelete: boolean;

  public form = new UntypedFormGroup({
    note: new UntypedFormControl(null, [Validators.required, Validators.maxLength(ELASTIC_MAX_STRING_LENGTH)]),
    isPublic: new UntypedFormControl(false),
  });

  public get editAlwaysEnabled(): boolean {
    return this.isEditEnabled && this.isPublicSettingEnabled;
  }

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store<fromShared.AppState>,
    private readonly permissionService: PermissionService,
  ) {}

  public ngOnInit(): void {
    const permissionType = Policy.getNotes(this.note.entityTypeId);
    this.hasPermissionToEdit = this.permissionService.canEdit(permissionType);
    this.hasPermissionToDelete = this.permissionService.canDelete(permissionType);

    combineLatest([
      this.loggedUser$,
      this.isEditMode$,
    ])
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(([loggedUser, isEditMode]) => {
        const isCreatedByThisUser = this.note?.createdBy?.id === (<UserInfo>loggedUser).id;

        this.canEdit = (!isEditMode && this.editAlwaysEnabled) || (!isEditMode && isCreatedByThisUser);
        this.canDelete = (!isEditMode && this.editAlwaysEnabled) || (!isEditMode && isCreatedByThisUser);
      });

    this.subscribeOnNoteChange();
    this.subscribeOnFormChange();

    this.isAllNotesExpanded$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        value => {
          this.isExpanded = value;
        },
      );
  }

  private subscribeOnNoteChange(): void {
    this.editableNote$
      .pipe(
        filter(note => (!this.editableNote && !!note) || (!note && !!this.editableNote)),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(note => {
        this.editableNote = note;
        this.form.patchValue({
          note: note ? note.html : null,
          isPublic: note?.isPublic,
        });
        this.store.dispatch(sharedActions.notesListActions.NoteHasChanges({ hasChanges: false }));
      });
  }

  private subscribeOnFormChange(): void {
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        filter((formValues: any) => this.editableNote && (formValues.note !== this.editableNote.html
                                    || formValues.isPublic !== this.editableNote.isPublic)),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((formValues: any) => {
        const { note, isPublic } = formValues;

        if (this.editableNote) {
          this.store.dispatch(sharedActions.notesListActions.NoteHasChanges({ hasChanges: true }));
          this.store.dispatch(sharedActions.notesListActions.UpdateEditableNote({
            note: {
              ...this.editableNote,
              html: note,
              isPublic,
            },
          }));
        } else {
          this.store.dispatch(sharedActions.notesListActions.UpdateEditableNote({ note: null }));
        }
      });
  }

  public isViewMode(id: number) {
    return !this.editableNote || (this.editableNote && this.editableNote.id !== id);
  }

  public toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  public edit(): void {
    this.isExpanded = true;
    this.store.dispatch(sharedActions.notesListActions.EditExistingNote({ note: this.note }));
  }

  public delete(): void {
    this.store.dispatch(sharedActions.notesListActions.DeleteNote({ id: this.note.id, entityTypeId: this.note.entityTypeId }));
  }

  public getDataSource(dataSourceId: number) {
    return dataSourceId ? DocumentDataSourceEnum[dataSourceId] : '';
  }

  public hasRelatedEntity() {
    return this.note.relatedEntityId && this.note.relatedEntityTypeId;
  }

  public clickOnRelatedEntity(): void {
    if (this.note.relatedEntityId) {
      switch (this.note.relatedEntityTypeId) {
        case EntityTypeEnum.ManualPaymentRequest:
        case EntityTypeEnum.PaymentRequest:
          this.store.dispatch(fromRootActions.NavigateToUrl({ url: `/disbursements/tabs/payment-requests/${this.note.relatedEntityId}` }));
          return;
        case EntityTypeEnum.Payments:
          this.store.dispatch(fromRootActions.NavigateToUrl({ url: `/admin/payments/${this.note.relatedEntityId}/tabs/details` }));
          return;
        default:
          return;
      }

    }
  }

  public getRelatedEntityTitle(): string {
    switch (this.note.relatedEntityTypeId) {
      case EntityTypeEnum.ManualPaymentRequest:
      case EntityTypeEnum.PaymentRequest:
        return `Payment Request (ID ${this.note.relatedEntityId})`;
      case EntityTypeEnum.Payments:
        return `Payment (ID ${this.note.relatedEntityId})`;
      default:
        return '';
    }
  }

  public ngOnDestroy(): void {
    this.store.dispatch(sharedActions.notesListActions.NoteHasChanges({ hasChanges: false }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
