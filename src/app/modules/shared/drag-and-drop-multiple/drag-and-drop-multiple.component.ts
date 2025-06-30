import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import * as fromShared from '@app/state';
import { Store } from '@ngrx/store';
import { IdValue } from '@app/models';
import { filter, takeUntil } from 'rxjs/operators';
import { MessageService } from '@app/services/message.service';
import { Document, DocumentLink } from '@app/models/documents';
import { EntityTypeDisplayEnum, EntityTypeEnum } from '@app/models/enums';
import { EntityType } from '@app/models/entity-type';
import { DragDropDocumentFormItem } from '@app/models/documents/drag-drop-document-form-item';
import * as actions from '../state/drag-and-drop-multiple/actions';
import * as selectors from '../state/drag-and-drop-multiple/selectors';

@Component({
  selector: 'app-drag-and-drop-multiple',
  templateUrl: './drag-and-drop-multiple.component.html',
  styleUrls: ['./drag-and-drop-multiple.component.scss'],
})
export class DragAndDropMultipleComponent implements OnDestroy, OnInit {
  @Input() public allowedFileTypes: string[];
  @Input() public selectedDocuments: Document[] = [];
  @Input() public selectedDocuments$: Observable<Document[]>;
  @Input() public title: string = 'Select Files';
  @Input() public onFilesSelected?: (documents: Document[]) => void;
  @Input() public componentWidth: number = 830;
  @Input() public inProgress: boolean = false;

  public allowedTypesCSV: string;
  public errorMessage: string;
  public form: UntypedFormGroup;
  public documentTypes: IdValue[];

  selectedFiles: File[] = [];

  public allDocumentTypes$ = this.store.select(selectors.dragDropMultipleSelectors.allDocumentTypes);
  public allDocumentTypes: IdValue[];

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private fb:UntypedFormBuilder,
    private store: Store<fromShared.AppState>,
    private messageService: MessageService,
  ) {
    this.form = this.fb.group({ documents: this.fb.array([]) });
  }

  documents() : UntypedFormArray {
    return this.form.get('documents') as UntypedFormArray;
  }

  newFileRow(document: Document): UntypedFormGroup {
    return this.fb.group({
      id: document.id,
      fileNameFull: document.fileNameFull || '-',
      description: document.description,
      file: document.fileContent,
      documentTypeId: document.documentType?.id,
    } as DragDropDocumentFormItem);
  }

  addFileRow(document: Document) {
    this.documents().push(this.newFileRow(document));
  }

  removeFileRow(i:number) {
    this.messageService
      .showDeleteConfirmationDialog('Confirm delete', 'Are you sure you want to delete this document?')
      .subscribe(answer => {
        if (!answer) {
          return;
        }

        this.documents().removeAt(i);
        this.form.markAsDirty();
        // update outer save btn
      });
  }

  getFileNameAt(i:number) {
    const values = this.documents().getRawValue();
    return values[i].fileNameFull;
  }

  validateForm(): boolean {
    return !this.errorMessage;
  }

  validateFiles(files: any[]): boolean {
    const invalidDocsList: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.description || !file.documentTypeId) {
        invalidDocsList.push(file.fileNameFull);
      }
    }
    if (invalidDocsList.length > 0) {
      this.errorMessage = (invalidDocsList.length === 1)
        ? `Name and Type are required fields for document ${invalidDocsList.join(', ')}.`
        : `Name and Type are required fields for documents: ${invalidDocsList.join(', ')}.`;
      return false;
    }

    this.errorMessage = '';
    return true;
  }

  public initForm(item) {
    this.documents().reset();
    (item?.documents || []).forEach(f => this.addFileRow(f));
  }

  ngOnInit() {
    this.store.dispatch(actions.GetDocumentTypesList());

    if (this.selectedDocuments?.length > 0) {
      this.initForm({ documents: this.selectedDocuments });
    }
    if (this.selectedDocuments$) {
      this.selectedDocuments$
        .pipe(
          filter(item => !!item),
          takeUntil(this.ngUnsubscribe$),
        )
        .subscribe(selectedDocuments => {
          this.selectedDocuments = selectedDocuments;
          this.initDocumentTypes();

          this.initForm({ documents: selectedDocuments });
        });
    }

    this.form.get('documents').valueChanges.subscribe(documents => {
      this.validateFiles(documents);
    });

    this.allDocumentTypes$.pipe(
      filter(allDocumentTypes => !!allDocumentTypes),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(allDocumentTypes => {
      this.allDocumentTypes = allDocumentTypes.map(dt => ({
        id: dt.id,
        name: `${dt.name}${dt.entityType?.name ? ` (${dt.entityType?.name})` : ''}`,
      })).sort((a, b) => (a.name > b.name ? 1 : -1));
      this.initDocumentTypes();
    });
  }

  private initDocumentTypes() {
    if (this.allDocumentTypes) {
      const existingIds = this.selectedDocuments.map(sd => sd.documentTypeId);
      const currentTypes = this.allDocumentTypes.slice(0, 10);
      if (existingIds.length > 0) {
        const found = this.allDocumentTypes.filter(dt => existingIds.includes(dt.id));
        currentTypes.push(...found);
      }
      this.documentTypes = currentTypes;
    }
  }

  onFilesSelectedInternal(files: File[]) {
    const documents = files.map(file => ({
      id: 0,
      documentLinks: [
        new DocumentLink({
          entityId: 0,
          entityType: new EntityType({ id: EntityTypeEnum.Tasks, name: EntityTypeDisplayEnum[EntityTypeEnum.Tasks] }),
        }),
      ],
      documentTypeId: undefined,
      fileContent: file,
      description: '',
      fileName: file.name,
      fileNameFull: file.name,
    } as Document));

    if (this.onFilesSelected) {
      this.onFilesSelected(documents);
    }

    documents.forEach(document => {
      this.addFileRow(document);
    });
  }

  public searchDocumentTypes(term: string): void {
    if (!term) {
      this.documentTypes = this.allDocumentTypes.slice(0, 10);
      return;
    }
    const termLower = term.toLocaleLowerCase();
    const documentTypes = [];
    let i = 0;
    while (documentTypes.length <= 10 && i < this.allDocumentTypes.length) {
      const itemName = this.allDocumentTypes[i].name;
      if (itemName.toLocaleLowerCase().indexOf(termLower) > -1) {
        documentTypes.push(this.allDocumentTypes[i]);
      }
      i++;
    }
    if (documentTypes.length > 0) {
      this.documentTypes = documentTypes;
    }
  }

  public searchFn() {
    return true;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
