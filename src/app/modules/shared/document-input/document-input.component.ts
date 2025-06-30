import { Component, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Document } from '@app/models/documents';
import { EntityTypeEnum } from '@app/models/enums';
import { ModalService } from '@app/services';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { sharedActions, sharedSelectors } from 'src/app/modules/shared/state/index';
import { UploadDocumentModalComponent } from '../upload-document-modal/upload-document-modal.component';
import { BaseControlValueAccessor } from '../_abstractions/base-control-value-accessor';

@Component({
  selector: 'app-document-input',
  templateUrl: './document-input.component.html',
  styleUrls: ['./document-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: DocumentInputComponent,
    },
  ],
})
export class DocumentInputComponent extends BaseControlValueAccessor implements OnInit {
  @Input() entityType: EntityTypeEnum;
  @Input() entityId: number;
  @Input() selectedDocumentTypeId: number;
  @Input() isDocumentTypeSelectDisabled: boolean;

  private readonly allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);
  private readonly ngUnsubscribe$ = new Subject<void>();

  private documentModalRef: BsModalRef;
  public document: Document = null;

  private allowedExtensions: string[] = [];

  constructor(
    private readonly modalService: ModalService,
    private readonly store: Store<any>,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.store.dispatch(sharedActions.commonActions.GetMimeTypes());

    this.allowedExtensions$
      .pipe(
        filter(allowedExtensions => !!allowedExtensions && !!allowedExtensions.length),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(val => { this.allowedExtensions = val; });
  }

  public writeValue(document: Document): void {
    this.document = document;
  }

  public onAddDocument(): void {
    if (this.disabled) {
      return;
    }

    const defaultParams = {
      entityTypeId: this.entityType,
      entityId: this.entityId,
      allowedExtensions: this.allowedExtensions,
      isAutonomic: true,
      title: 'Upload Document',
      document: this.document,
      onDocumentAdded: this.saveDocument.bind(this),
      onDocumentDelete: this.deleteDocument.bind(this),
      onDocumentUpdated: this.saveDocument.bind(this),
      selectedDocumentTypeId: this.selectedDocumentTypeId,
      isDocumentTypeSelectDisabled: this.isDocumentTypeSelectDisabled,
    };

    this.documentModalRef = this.modalService.show(UploadDocumentModalComponent, {
      initialState: defaultParams,
      class: 'modal-lg',
    });
  }

  private deleteDocument(): void {
    this.document = null;
    this.documentModalRef.hide();
    this.markAsTouched();
    this.onChangeCallback(this.document);
    this.change.emit(this.document);
  }

  private saveDocument(document: Document): void {
    this.document = document;
    this.documentModalRef.hide();
    this.markAsTouched();
    this.onChangeCallback(this.document);
    this.change.emit(this.document);
  }
}
