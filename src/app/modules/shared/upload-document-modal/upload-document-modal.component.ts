import { FileHelper } from '@app/helpers/file.helper';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
// eslint-disable-next-line import/no-extraneous-dependencies
import isFunction from 'lodash/isFunction';

import { Document, DocumentLink, DocumentType } from '@app/models/documents';
import { DragAndDropService, PermissionService, ToastService, ValidationService } from '@app/services';
import { Policy } from '@app/modules/auth/policy';
import { PermissionActionTypeEnum, EntityTypeEnum, ProductCategory, DocumentType as DocumentTypeEnum, EntityTypeDisplayEnum } from '@app/models/enums';
import { EntityType } from '@app/models/entity-type';

import { IdValue, UserInfo } from '@app/models';
import * as MsgReader from '@sharpenednoodles/msg.reader-ts';
import { AdvancedSearchTypeEnum } from '@app/models/advanced-search/advanced-search-types.enum';
import * as fromAuth from '@app/modules/auth/state';
import { ProductCategoryDto } from '@app/models/product-workflow/product-category-dto';
import { SaveEmail } from '@app/modules/call-center/communication/state/actions';
import { CommonHelper } from '../../../helpers/common.helper';
import * as commonActions from '../state/common.actions';
import * as documentUploadActions from '../state/upload-document/actions';
import * as documentDetailsActions from '../state/document-details/actions';

import * as fromShared from '../state';
import { dropdownValues } from '../../../state';
import { ValidationForm } from '../_abstractions/validation-form';
import { DragAndDropComponent } from '../drag-and-drop/drag-and-drop.component';
import { UploadDocumentAdvanceShareComponent } from '../upload-document-advance-share/upload-document-advance-share.component';

const { sharedActions } = fromShared;
const { sharedSelectors } = fromShared;
const OTHER_OPTION_NAME = 'Other';
@Component({
  selector: 'app-upload-document-modal',
  templateUrl: './upload-document-modal.component.html',
  styleUrls: ['./upload-document-modal.component.scss'],
})
export class UploadDocumentModalComponent extends ValidationForm implements OnInit, OnDestroy {
  @ViewChild(DragAndDropComponent) dragAndDropComponent: DragAndDropComponent;
  @ViewChild(UploadDocumentAdvanceShareComponent) advanceShareComponent: UploadDocumentAdvanceShareComponent;

  public title: string;
  public entityType = EntityTypeEnum;
  public entityId: number;
  public entityTypeId: number;
  public document: Document;
  public allowedExtensions: string[];
  public isAutonomic: boolean;
  public isShowOtherTypeField: boolean;
  public selectedDocumentTypeId: number | null = null;
  public isDocumentTypeSelectDisabled: boolean = false;
  public isUpdate: boolean = false;
  public stopPropagation: boolean = true;
  public emailDragAndDropEnabled: boolean = false;
  public isInternalUser: boolean = false;

  /**
   * Gets or sets the flag indicating that file name should be filled automatically
   * when file is selected.
   *
   * @memberof UploadDocumentModalComponent
   */
  public setFileNameOnFileSelect = false;

  public onDocumentAdded: (document: Document) => void;
  public onDocumentsAdded?: (document: Document[]) => void;
  public onDocumentDelete: (document: Document) => void;
  public onDocumentUpdated: (document: Document) => void;

  public documentTypes: DocumentType[];
  public documentTypesInitialValue: DocumentType[];
  public productCategories: IdValue[];
  public documentTypesByCategoryId: DocumentType[];
  public uploadForm: UntypedFormGroup;
  public selectedFile: File;
  public attachments: File[];
  public maxFileSizeInBytes: number = 500 * (1024 * 1024); // 500 MB

  public dropDownValues$ = this.store.select(dropdownValues);
  public errorMessage$ = this.store.select(sharedSelectors.uploadDocumentSelectors.error);
  private readonly user$ = this.store.select(fromAuth.authSelectors.getUser);

  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  public productCategories$ = this.store.select(fromShared.sharedSelectors.documentsListSelectors.productCategories);
  public documentTypes$ = this.store.select(fromShared.sharedSelectors.documentsListSelectors.documentTypes);
  public documentTypesByCategoryId$ = this.store.select(fromShared.sharedSelectors.documentsListSelectors.documentTypesByCategoryId);

  public productCategoryListByEntityType = {
    [EntityTypeEnum.Projects]: [
      ProductCategory.MedicalLiens,
      ProductCategory.All,
    ],
    [EntityTypeEnum.Clients]: [
      ProductCategory.Bankruptcy,
      ProductCategory.ClaimsAdministration,
      ProductCategory.Probate,
      ProductCategory.QSFAdministration,
      ProductCategory.ReleaseAdmin,
    ],
  };

  protected get validationForm(): UntypedFormGroup {
    return this.uploadForm;
  }

  public get isUploadDocumentDisabled(): boolean {
    return !this.uploadForm.dirty || !this.selectedFile;
  }

  public get isSearchable(): boolean {
    return this.documentTypes?.length > 8;
  }

  public get canSelectService(): boolean {
    return this.entityTypeId === this.entityType.Projects || this.entityTypeId === this.entityType.Clients;
  }

  public get showIsPublic(): boolean {
    return this.isInternalUser
      && [EntityTypeEnum.Projects, EntityTypeEnum.Matter].includes(this.entityTypeId)
      && this.permissionService.has(PermissionService.create(Policy.getDocuments(+this.entityTypeId), PermissionActionTypeEnum.SetDocumentPublicFlag));
  }

  readonly awaitedActionTypes = [
    documentDetailsActions.SaveUpdatedDocumentComplete.type,
    documentDetailsActions.DocumentDetailsError.type,
    documentUploadActions.CreateDocumentComplete.type,
    documentUploadActions.DocumentError.type,
    commonActions.FormInvalid.type,
  ];

  constructor(
    private fb: UntypedFormBuilder,
    public uploadDocumentModal: BsModalRef,
    private store: Store<fromShared.AppState>,
    private readonly dragAndDropService: DragAndDropService,
    private readonly permissionService: PermissionService,
    private toaster: ToastService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.createForm();

    this.user$.pipe(
      filter((user: UserInfo) => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((user: UserInfo) => {
      this.isInternalUser = user.defaultOrganization?.isMaster;
      this.initForm();

      if (!this.document) {
        return;
      }
      this.toggleShareValidators();
    });
  }

  private initForm(): void {
    this.fillForm();
    this.setDropdownValue();

    const productCategory = this.document?.documentType?.productCategoryId;
    if (this.entityTypeId === EntityTypeEnum.Probates) {
      this.loadDocumentTypesByCategoryId(ProductCategory.Probate, EntityTypeEnum.Clients);
    } else if (this.entityTypeId !== EntityTypeEnum.Probates && productCategory && this.canSelectService) {
      this.loadDocumentTypesByCategoryId(productCategory, this.entityTypeId);
    } else {
      this.store.dispatch(sharedActions.documentsListActions.GetDocumentTypesByEntityId({ entityTypeId: this.entityTypeId, additionalDocumentTypeId: this.document?.documentTypeId }));
    }

    this.documentTypes$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((documentTypes: DocumentType[]) => {
      this.documentTypes = documentTypes;
      this.documentTypesInitialValue = documentTypes;
      this.setDefaultDocumentType();
    });

    if (this.productCategoryListByEntityType.hasOwnProperty(this.entityTypeId)) {
      this.store.dispatch(sharedActions.documentsListActions.GetProductCategoriesRequest({ entityTypeId: this.entityTypeId }));

      if (!this.isUpdate) {
        this.uploadForm.controls.service.setValue(null);
      }

      const productCategoryList = this.productCategoryListByEntityType[this.entityTypeId];

      this.productCategories$.pipe(
        filter((value: ProductCategoryDto[]) => value !== null),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((categories: ProductCategoryDto[]) => {
        this.productCategories = categories.filter((value: ProductCategoryDto) => productCategoryList.includes(value.id)).map((x: ProductCategoryDto) => new IdValue(x.id, x.shortName));
      });

      this.uploadForm.controls.service.valueChanges.subscribe((value: any) => {
        this.uploadForm.controls.type.setValue(null);

        if (value) {
          this.loadDocumentTypesByCategoryId(value, this.entityTypeId);
        } else {
          this.documentTypes = this.documentTypesInitialValue;
        }
      });
    }

    this.uploadForm.controls.type.valueChanges.subscribe((value: any) => {
      const typeName = this.documentTypes.find((type: DocumentType) => type.id === value)?.name;
      this.isShowOtherTypeField = typeName === OTHER_OPTION_NAME;

      this.toggleOtherTypeValidators(this.isShowOtherTypeField);
    });

    this.uploadForm.controls.name.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => this.validateNameRequired());

    if (this.emailDragAndDropEnabled) {
      this.dragAndDropService.subscribeToDragAndDropEvents(
        'app-upload-document-modal',
        (error: string) => {
          this.dragAndDropComponent.error = error;
        },
        (
          file: File,
          data: MsgReader.MSGFileData,
          attachments: MsgReader.MSGAttachmentData[],
        ) => {
          const fileName = file.name;
          const fileExtension = FileHelper.getExtension(fileName);
          const hasFileAllowedExtension = !!this.allowedExtensions.find((extension: string) => extension.includes(fileExtension));
          this.dragAndDropComponent.error = !hasFileAllowedExtension ? `File ${fileName} is not the proper format` : '';

          const files = [];
          this.selectedFile = file || null;
          if (data) {
            for (let i = 0; i < attachments.length; i++) {
              const currentAttachment = data.attachments[i] as any;
              const attachmentExtension = FileHelper.getExtensionExtended(currentAttachment.fileName);
              if (this.allowedExtensions.find((extension: string) => extension.includes(`.${attachmentExtension}`))) {
                files.push(
                  new File(
                    [attachments[i].content],
                    currentAttachment.fileName,
                    { type: currentAttachment.mimeType ? currentAttachment.mimeType : 'application/octet-stream' },
                  ),
                );
              }
            }
            this.attachments = files;
          } else {
            this.attachments = [];
          }

          const extension = FileHelper.getExtension(this.selectedFile.name);
          const subj = data?.subject ? `${data?.subject}.${extension}` : this.selectedFile.name;
          this.uploadForm?.get('name').setValue(subj);
          if (extension === 'msg') {
            this.uploadForm?.controls.type.setValue(DocumentTypeEnum.CommunicationEmailMessage);
          }
          this.uploadForm?.markAsDirty();
        },
      );
    }
  }

  public get deletePermissions(): string {
    return PermissionService.create(Policy.getDocuments(this.entityTypeId), PermissionActionTypeEnum.Delete);
  }

  public get fileName(): string {
    if (this.selectedFile) {
      return this.selectedFile.name;
    }

    if (this.document) {
      return this.document.fileNameFull;
    }

    return null;
  }

  private createForm(): void {
    this.uploadForm = this.fb.group({
      name: ['', [ValidationService.notEmptyValidator, Validators.maxLength(250), ValidationService.noWhitespaceBeforeTextValidator]],
      service: [null],
      type: ['', Validators.required],
      otherType: ['', Validators.maxLength(255)],
    });
  }

  private fillForm(): void {
    if (!this.document) {
      return;
    }

    this.isUpdate = true;
    this.selectedFile = { name: this.document.fileNameFull } as File;
    this.attachments = [];

    this.uploadForm.patchValue({
      name: this.document.description,
      type: this.document.documentType,
      otherType: this.document.otherDocumentType,
      service: this.document.documentType.productCategoryId || null,
    });
    this.toggleShareValidators();
  }

  private toggleShareValidators(): void {
    this.isShowOtherTypeField = this.document.documentType.name === OTHER_OPTION_NAME;
    this.toggleOtherTypeValidators(this.isShowOtherTypeField);
  }

  private setDropdownValue(): void {
    if (this.documentTypes && this.documentTypes.length) {
      this.uploadForm.controls.type.setValue(this.document?.documentType.id);
    }
  }

  public onSave(): void {
    const isFormValid = super.validate();
    const isNamePresent = this.validateNameRequired();
    if (!isFormValid || !isNamePresent) {
      this.store.dispatch(commonActions.FormInvalid());
      return;
    }

    if (this.document) {
      this.updateDocument();
    } else {
      this.addDocument();
    }
    this.attachments = [];
  }

  public onDelete(): void {
    if (isFunction(this.onDocumentDelete)) {
      this.onDocumentDelete(this.document);
    }
  }

  public onFilesSelected(files: File[]): void {
    this.attachments = [];
    this.selectedFile = files[0] || null;
    // Validation for file size
    if (this.selectedFile && this.selectedFile.size > this.maxFileSizeInBytes) {
      this.dragAndDropComponent.error = `File exceeds ${FileHelper.bytesToMegabytes(this.maxFileSizeInBytes)} MB`;
      this.selectedFile = null;
      return;
    }

    if (this.selectedFile.name.length > FileHelper.maxFileNameLength) {
      this.toaster.showWarning('File name exceeds the maximum length. The name of the file has been truncated.');
    }

    if (this.setFileNameOnFileSelect && this.uploadForm) {
      const extension = FileHelper.getExtension(this.selectedFile.name);
      this.uploadForm.get('name').setValue(FileHelper.extractFileName(this.selectedFile.name, extension));
    }
    if (this.selectedFile) {
      this.uploadForm.markAsDirty();
    }
  }

  public onFormChanged(): void {
    this.uploadForm.markAsDirty();
  }

  public ngOnDestroy(): void {
    this.store.dispatch(documentUploadActions.ResetCreateDocumentState());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private updateDocument(): void {
    if (this.isUploadDocumentDisabled) {
      this.store.dispatch(commonActions.FormInvalid());
      return;
    }

    const value = this.uploadForm.getRawValue();
    const sharedFormValue = this.advanceShareComponent?.uploadForm?.getRawValue();

    this.document.description = value.name;
    this.document.documentType = this.documentTypes.find((i: DocumentType) => i.id === value.type);
    this.document.otherDocumentType = value.otherType;
    this.document.fileContent = this.selectedFile && this.selectedFile.size > 0 ? this.selectedFile : this.document.fileContent;
    this.document.fileNameFull = this.selectedFile ? this.selectedFile.name : this.document.fileNameFull;

    if (!CommonHelper.isNullOrUndefined(this.document.documentLinks) && this.document.documentLinks.length > 0) {
      this.document.documentLinks[0].isPublic = this.showIsPublic && sharedFormValue
        ? (sharedFormValue.shareType === AdvancedSearchTypeEnum.OrgLevel)
        : false;
    }
    this.document.organizationAccesses = (this.showIsPublic && sharedFormValue && (sharedFormValue.shareType === AdvancedSearchTypeEnum.OrgLevel))
      ? sharedFormValue.shareWith || null
      : null;

    if (this.onDocumentUpdated) {
      this.onDocumentUpdated(this.document);
    }

    if (!this.isAutonomic) {
      this.store.dispatch(documentDetailsActions.SaveUpdatedDocument({
        file: this.selectedFile && this.selectedFile.size > 0 ? this.selectedFile : null,
        document: this.document,
        onDocumentUpdated: this.onDocumentAdded,
      }));
    }
  }

  private addDocument(): void {
    if (!this.selectedFile) {
      this.store.dispatch(commonActions.FormInvalid());
      return;
    }

    const { uploadForm: form, entityId, entityTypeId } = this;
    const formValue = form.getRawValue();

    const sharedFormValue = this.advanceShareComponent?.uploadForm?.getRawValue();
    const files = [this.selectedFile, ...this.attachments];

    const documents: Document[] = [];
    for (let i = 0; i < files.length; i++) {
      let documentType: DocumentType;
      if (i === 0) {
        documentType = this.documentTypes.find((t: DocumentType) => t.id === formValue.type);
      } else {
        documentType = new DocumentType({
          id: DocumentTypeEnum.CommunicationEmailAttachment,
          name: 'E-mail Attachment',
          isActive: true,
        });
      }

      const document = new Document({
        id: this.document?.id || 0,
        description: i === 0 ? formValue.name : '',
        documentType,
        otherDocumentType: i === 0 ? formValue.otherType : undefined,
        documentLinks: [new DocumentLink({
          entityId: +entityId || 0,
          entityType: new EntityType({ id: +entityTypeId, name: EntityTypeDisplayEnum[+entityTypeId] }),
          isPublic: this.showIsPublic && sharedFormValue
            ? (sharedFormValue.shareType === AdvancedSearchTypeEnum.OrgLevel)
            : false,
        })],
        organizationAccesses: (this.showIsPublic && sharedFormValue && (sharedFormValue.shareType === AdvancedSearchTypeEnum.OrgLevel))
          ? sharedFormValue.shareWith || null
          : null,
        fileContent: files[i],
        fileNameFull: files[i].name,
      });

      if (FileHelper.getExtension(files[i].name) === 'msg') this.store.dispatch(SaveEmail({ email: files[i] }));

      documents.push(document);
    }

    if (this.onDocumentsAdded) {
      this.onDocumentsAdded(documents);
    }

    documents.forEach((document: Document) => {
      if (!this.isAutonomic) {
        this.store.dispatch(documentUploadActions.CreateDocument({
          file: document.fileContent,
          document,
          onDocumentLoaded: this.onDocumentAdded,
        }));
      } else if (this.onDocumentAdded) {
        this.onDocumentAdded(document);
      }
    });
  }

  private toggleOtherTypeValidators(condition: boolean): void {
    const control = this.uploadForm.controls.otherType;
    if (condition) {
      control.setValidators(Validators.required);
      control.setValidators(Validators.maxLength(255));
      control.updateValueAndValidity();
    } else {
      control.setValidators(null);
      control.updateValueAndValidity();

      control.setValue('');
      control.markAsPristine();
      control.markAsUntouched();
    }
  }

  private validateNameRequired(): boolean {
    const nameControl = this.uploadForm.controls.name;

    if (nameControl.value) {
      return true;
    }

    nameControl.setErrors({ required: true });
    nameControl.markAsTouched();
    return false;
  }

  private setDefaultDocumentType(): void {
    if (this.selectedDocumentTypeId && this.isDocumentTypeSelectDisabled) {
      this.uploadForm.controls.type.setValue(this.selectedDocumentTypeId, { emitEvent: false });
      this.uploadForm.controls.type.disable();
    }
  }

  private loadDocumentTypesByCategoryId(productCategoryId: number, entityTypeId: number): void {
    this.store.dispatch(sharedActions.documentsListActions.GetDocumentTypeByCategoryIdRequest({
      productCategoryId,
      entityTypeId,
    }));
    this.documentTypesByCategoryId$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((documentTypesByCategoryId: DocumentType[]) => {
      this.documentTypes = documentTypesByCategoryId;
      if (this.document
          && this.document.documentType
          && this.uploadForm
          && !CommonHelper.isNullOrUndefined(this.uploadForm.get('type').value)) {
        this.setDropdownValue();
      }
    });
  }
}
