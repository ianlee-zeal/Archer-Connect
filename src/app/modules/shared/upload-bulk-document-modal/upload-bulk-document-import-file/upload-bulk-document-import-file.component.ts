import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ValidationForm } from '../../_abstractions/validation-form';
import * as fromShared from '../../state';
import { DocumentImport } from '@app/models/documents';

const { sharedSelectors, sharedActions } = fromShared;

@Component({
  selector: 'app-upload-bulk-document-import-file',
  templateUrl: './upload-bulk-document-import-file.component.html',
  styleUrls: ['./upload-bulk-document-import-file.component.scss']
})
export class UploadBulkDocumentImportFileComponent extends ValidationForm implements OnInit, OnDestroy {
  @Input() entityId: number;
  @Input() entityTypeId: number;
  @Input() allowedExtensions: string[] = [];
  @Input() documentImport: DocumentImport;
  public form: UntypedFormGroup;
  public selectedFile: File;
  public errorMessage$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.error);
  public pusherMessage: string;

  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private store: Store<fromShared.AppState>,) {
      super()
    }

  public ngOnInit(): void {
    this.createForm();
  }

  private createForm() {
    this.form = this.fb.group({
      // description: ['', [Validators.required, Validators.maxLength(250)]],
    });

    this.form.valueChanges
    .pipe(takeUntil(this.ngUnsubscribe$))
    .subscribe(() => {
      this.updateState();
    });
  }

  private updateState(): void {
    if (!super.validate() || !this.selectedFile) {
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.IsValidUpload({ isValidUpload: false }));
      return;
    } else {
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.IsValidUpload({ isValidUpload: true }));
    }


    if(this.documentImport.jobId) {
      this.documentImport = {
        entityId: this.documentImport.entityId,
        entityTypeId: this.documentImport.entityTypeId,
        templateId: this.documentImport.templateId,
      } as DocumentImport;
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.ResetDocumentImportPreviewRows());
    }
    const documentImport: DocumentImport = this.documentImport;
    documentImport.fileContent = this.selectedFile,
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetDocumentImport({ documentImport }));
  }

  onFilesSelected(files: File[]) {
    this.selectedFile = files[0] || null;
    this.updateState();
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
