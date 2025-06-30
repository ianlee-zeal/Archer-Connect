import { NEW_ID } from '@app/helpers/constants';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';

import { EntityTypeEnum } from '@app/models/enums';
import { Pager } from '@shared/grid-pager/pager';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Note } from '@app/models';
import { OnPage } from '../_interfaces';
import * as fromShared from '../state';

const { sharedActions, sharedSelectors } = fromShared;

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
})
export class NotesListComponent implements OnInit, OnChanges, OnPage {
  @Input() public entityId: number;
  @Input() public entityTypeId: EntityTypeEnum;
  @Input() additionalEntityTypeIds: EntityTypeEnum[] = [];
  @Input() pageSize = 20;
  @Input() isPublicSettingEnabled = false;
  @Input() isEditEnabled = true;

  @Output() public newRecord: EventEmitter<any> = new EventEmitter();

  private editableNote: Note;

  public readonly editableNote$ = this.store.select(sharedSelectors.notesListSelectors.editableNote);
  public readonly notes$ = this.store.select(sharedSelectors.notesListSelectors.notes);
  public readonly totalCount$ = this.store.select(sharedSelectors.notesListSelectors.totalCount);
  constructor(
    private store: Store<fromShared.AppState>,
  ) {}

  private ngUnsubscribe$ = new Subject<void>();
  public pager: Pager;

  public ngOnInit(): void {
    this.editableNote$
      .pipe(
        filter(note => !!note),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(note => {
        this.editableNote = note;
      });

    this.pager = {
      currentPage: 1,
      pageSize: this.pageSize,
      totalCount: 0,
      entityLabel: '',
      isForceDefaultBackNav: false,
    };

    this.fetchNotesList(0, this.pager.pageSize);

    this.totalCount$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        totalCount => {
          this.pager.totalCount = totalCount;
        },
      );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.entityId && !changes.entityId.firstChange) {
      this.fetchNotesList(0, this.pager.pageSize);
    }
  }

  public callNewRecord(): void {
    this.newRecord.emit();
  }

  public showNewRecordLink(): boolean {
    return !!this.newRecord.observers.length;
  }

  public toPage(pageNumber: number): void {
    const endRow: number = pageNumber * this.pager.pageSize;
    const startRow: number = endRow - this.pager.pageSize;
    this.pager = {
      ...this.pager,
      currentPage: pageNumber,
    };

    this.fetchNotesList(startRow, endRow);
  }

  private fetchNotesList(startRow: number, endRow: number): void {
    if (this.entityId === NEW_ID && this.editableNote) {
      this.store.dispatch(sharedActions.notesListActions.GetNotesListComplete({ notes: [this.editableNote], totalCount: 1 }));
    } else {
      this.store.dispatch(sharedActions.notesListActions.GetNotesList({
        searchParams: {
          searchOptions: {
            startRow,
            endRow,
            sortModel: [{ colId: 'lastModifiedDate', sort: 'desc' }],
          },
          entityId: this.entityId,
          entityTypeIds: [this.entityTypeId, ...this.additionalEntityTypeIds]
        },
      }));
    }
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
