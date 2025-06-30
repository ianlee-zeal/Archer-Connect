import { sharedSelectors } from '@app/modules/shared/state';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Action, Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { DocumentType } from '@app/models/documents';
import { DocumentType as DocumentTypeEnum } from '@app/models/enums/document-generation/document-type.enum';

import { MessageService, ModalService, PermissionService, ValidationService } from '@app/services';
import { PermissionActionTypeEnum } from '@app/models/enums';
import * as documentTemplateActions from '@app/modules/document-templates/state/actions';
import * as documentTemplatesSelectors from '@app/modules/document-templates/state/selectors';

import { CreateOrUpdateTemplateRequest } from '@app/models/documents/document-generators';
import { AppState } from '@app/state';
import { FileHelper } from '@app/helpers/file.helper';
import { KeyValuePair } from '@app/models/utils';
import { finalize, switchMap, take, takeUntil } from 'rxjs/operators';
import { LevelEnum } from '@app/models/enums/level.enum';
import { ClosingStatementDocumentStatusEnum } from '@app/models/enums/closing-statement-document-status.enum';
import { DocuSignCSResponse } from '@app/models/docusign-sender/docusign-cs-response';
import { PermissionTypeEnum } from '../../../../models/enums/permission-type.enum';
import { ValidationForm } from '../../_abstractions/validation-form';
import * as fromShared from '../../state';
import * as commonActions from '../../state/common.actions';
import { ProjectSelectionModalComponent } from '../../entity-selection-modal/project-selection-modal.component';
import { DocuSignSenderTestComponent } from '../../docusign-sender-test/docusign-sender-test.component';
import { TestCSGenerationRequest } from '@app/models/docusign-sender/test-cs-generation-request';

export interface IDocumentTemplateEditModalData {
  title: string;
  template: CreateOrUpdateTemplateRequest;
  selectedProjects: KeyValuePair<number, string>[];
  onTemplateCreateOrUpdate?: (document: CreateOrUpdateTemplateRequest) => void;
  onTemplateDelete: (id: number) => void;
  onTestDITFile: (id: number, request: TestCSGenerationRequest) => void;
}

@Component({
  selector: 'app-document-template-edit-modal',
  templateUrl: './document-template-edit-modal.component.html',
  styleUrls: ['./document-template-edit-modal.component.scss'],
})
export class DocumentTemplateEditModalComponent extends ValidationForm implements OnInit, OnDestroy, IDocumentTemplateEditModalData {
  @ViewChild(DocuSignSenderTestComponent, { static: false }) childComponent: DocuSignSenderTestComponent;

  private readonly ngUnsubscribe$ = new Subject<void>();

  public readonly errorMessage$ = this.store.select(sharedSelectors.uploadDocumentSelectors.error);

  public readonly documentTypes$ = this.store.select(documentTemplatesSelectors.documentTypes);
  public readonly documentStatuses$ = this.store.select(documentTemplatesSelectors.documentStatuses);
  public readonly allowedExtensions$ = this.store.select(fromShared.sharedSelectors.commonSelectors.allowedFileExtensions);

  public errorMessage: string;
  public title: string;
  public template: CreateOrUpdateTemplateRequest;
  public projectsList: string[];

  public onTemplateCreateOrUpdate: (request: CreateOrUpdateTemplateRequest) => void;
  public onTemplateDelete: (id: number) => void;
  public onTestDITFile: (id: number, request: TestCSGenerationRequest) => void;
  public docuSignDocumentType = DocumentTypeEnum.DocusignIntegrationTemplate;

  public documentTypes: DocumentType[];
  public documentStatuses: DocumentType[];

  public uploadForm: UntypedFormGroup;
  public uploadDocusignForm: UntypedFormGroup;

  public selectedFile: File;
  public projectFieldsEnabled: boolean;
  public selectedProjects: KeyValuePair<number, string>[];
  public validationFailed = false;

  public levelsList = [
    { name: LevelEnum[LevelEnum.Global], id: LevelEnum.Global },
    { name: LevelEnum[LevelEnum.Project], id: LevelEnum.Project },
  ];

  public eDeliveryUpdateDisabled = true;

  protected get validationForm(): UntypedFormGroup {
    return this.uploadForm;
  }

  get isCreate(): boolean {
    return this.template && !this.template.documentId;
  }

  public get canAddOrUpdate(): boolean {

    const baseConditions = this.uploadForm && this.uploadForm.valid;
    const eDeliveryCheck = this.showDocusignFields();

    if (!this.isCreate) {
      return baseConditions && (eDeliveryCheck ? !this.eDeliveryUpdateDisabled : true) && !this.showIncorrectFileType();
    }

    return baseConditions && (eDeliveryCheck ? !this.eDeliveryUpdateDisabled : true) && !!this.selectedFile;
  }

  get deletePermissions(): string {
    return PermissionService.create(PermissionTypeEnum.Templates, PermissionActionTypeEnum.Delete);
  }

  readonly awaitedSubmitActionTypes = [
    documentTemplateActions.CreateOrUpdateTemplateRequestSuccess.type,
    documentTemplateActions.CreateOrUpdateTemplateCanceled.type,
    documentTemplateActions.Error.type,
  ];

  readonly awaitedDeleteActionTypes = [
    documentTemplateActions.DeleteDocumentTemplateSuccess.type,
    documentTemplateActions.DeleteDocumentTemplateCancelled.type,
    documentTemplateActions.Error.type,
  ];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly modalRef: BsModalRef,
    private readonly store: Store<AppState>,
    private readonly messageService: MessageService,
    private modalService: ModalService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.store.dispatch(documentTemplateActions.GetDocuSignIntegrationTemplatesDropdownValues({ documentType: this.docuSignDocumentType }));
    this.store.dispatch(commonActions.GetMimeTypes());
    this.store.dispatch(documentTemplateActions.GetDocumentTypesForTemplates());
    if (this.template && this.template.documentTypeId) {
      this.onDocumentTypeChange(this.template.documentTypeId);
    }

    if (this.isCreate) {
      this.store.dispatch(documentTemplateActions.GetDocumentStatuses());
    }

    this.uploadForm = this.formBuilder.group({
      name: [this.template.name || '', [Validators.maxLength(250), Validators.required, ValidationService.noWhitespaceBeforeTextValidator, ValidationService.notAllowedCharactersInTemplateValidator]],
      projects: null,
      projectIds: null,
      isGlobal: true,
      documentTypeId: [this.template.documentTypeId || '', Validators.required],
      documentStatusId: [this.template.documentStatusId || '', Validators.required],
    });

    if (this.uploadForm.controls.documentTypeId.value === DocumentTypeEnum.ClosingStatement) {
      this.projectFieldsEnabled = true;
      this.uploadForm.controls.projects.patchValue(this.template?.projects);
      this.uploadForm.controls.projectIds.patchValue(this.template?.projectIds);
      this.uploadForm.controls.isGlobal.patchValue(Number(this.template?.isGlobal));

      this.projectsList = this.selectedProjects?.map((project: KeyValuePair<number, string>) => project.value);
    }

    this.manageProjectFields();
  }

  manageProjectFields(): void {
    this.uploadForm.controls.documentTypeId.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(type => {
      if (type === DocumentTypeEnum.ClosingStatement) {
        this.projectFieldsEnabled = true;
        this.uploadForm.controls.projects.setValue(null);
        this.uploadForm.controls.projectIds.setValue(null);
      } else {
        this.projectFieldsEnabled = false;
        this.uploadForm.controls.projects.setValue(null);
        this.uploadForm.controls.projectIds.setValue(null);
      }

      this.uploadForm.controls.isGlobal.setValue(LevelEnum.Global);
    });

    this.uploadForm.controls.isGlobal.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(value => {
      if (value) {
        this.uploadForm.controls.projectIds.setValue(null);
        this.uploadForm.controls.projects.setValue(null);
        this.uploadForm.controls.projects.disable();
      } else {
        this.uploadForm.controls.projects.enable();
      }
    });
  }

  onClose(): void {
    if (!this.validationFailed) {
      this.modalRef.hide();
      const docusignResponse = new DocuSignCSResponse();
      this.store.dispatch(documentTemplateActions.TestDITFileSuccess({ docusignResponse }));
    }
  }

  showIncorrectFileType(): boolean {
    let showMessage = false;
    if (this.uploadForm && this.uploadForm.get('documentTypeId').value === this.docuSignDocumentType && this.fileName && !this.fileName.toLowerCase().endsWith('.fsf')) {
      showMessage = true;
    }
    return showMessage;
  }

  onDocumentTypeChange(documentTypeId: number): void {
    if (documentTypeId === DocumentTypeEnum.DocusignIntegrationTemplate) {
      this.store.dispatch(fromShared.sharedActions.commonActions.SetAllowedFileExtensions({ allowedFileExtensions: ['.fsf'] }));
    }
    if (this.uploadForm) {
      this.uploadForm.get('documentStatusId').setValue(null);
    }
    this.store.dispatch(documentTemplateActions.GetDocumentStatusesForDocumentType({ documentTypeId }));
  }

  get fileName(): string {
    if (this.selectedFile) {
      return this.selectedFile.name;
    }

    if (this.template) {
      return this.template.fileName;
    }

    return null;
  }

  onTestFile(): void {
    this.childComponent.onTestDITFile(true);
  }

  onTestDITFileEvent(templateId: number, request: TestCSGenerationRequest) {
    this.onTestDITFile(templateId, request);
  }

  disableGenerateButton(): boolean {
    return this.selectedFile != null;
  }

  onSave(): void {
    this.validationFailed = false;

    if (!super.validate()) {
      return;
    }

    if (this.showDocusignFields()) {
      this.childComponent.onUpdateOrUpload()
        .pipe(
          switchMap(() => this.childComponent.updateAllowed$.pipe(take(1))),
          finalize(() => {
            this.validationFailed = false;
          }),
        )
        .subscribe((allowed: boolean) => {
          if (allowed) {
            this.createOrUpdateTemplate(this.selectedFile);
          } else if (!allowed) {
            this.validationFailed = true;
            this.store.dispatch(documentTemplateActions.CreateOrUpdateTemplateCanceled());
          }
        });
    } else {
      this.createOrUpdateTemplate(this.selectedFile);
    }
  }

  onDelete(): void {
    this.messageService.showDeleteConfirmationDialog(
      'Confirm delete',
      'Are you sure you want to delete selected Document Template?',
    ).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.onTemplateDelete(this.template.id);
      } else {
        this.store.dispatch(documentTemplateActions.DeleteDocumentTemplateCancelled());
      }
    });
  }

  showDocusignFields(): boolean {
    const template = this.template;
    const isDocx = template?.id !== null
      && template?.id !== 0
      && template?.fileName?.substring(template.fileName.lastIndexOf('.') + 1).toLowerCase() === 'docx'
      && template?.documentTypeId === DocumentTypeEnum.ClosingStatement;

    const isUploadDocx = this.selectedFile?.name?.substring(this.selectedFile.name.lastIndexOf('.') + 1).toLowerCase() === 'docx'
      && this.uploadForm?.get('documentTypeId').value === DocumentTypeEnum.ClosingStatement;

    return isDocx || isUploadDocx;
  }

  onFilesSelected(files: File[]): void {
    this.selectedFile = files[0] || null;
  }

  onDeleteFinished(action: Action): void {
    if (action?.type === documentTemplateActions.DeleteDocumentTemplateCancelled.type) {
      return;
    }
    this.onClose();
  }

  onOpenProjectModal(): void {
    if (this.uploadForm.controls.isGlobal.value) {
      return;
    }

    const selectedEntities = this.selectedProjects?.map((project: KeyValuePair<number, string>) => ({
      key: project.key,
      value: project.value,
      selected: true,
    }));

    this.modalService.show(ProjectSelectionModalComponent, {
      initialState: {
        isMultiple: true,
        selectedEntities: selectedEntities || [],
        onEntitySelected: (entities: KeyValuePair<number, string>[]) => this.onProjectSelected(entities),
      },
      class: 'entity-selection-modal',
    });
  }

  private onProjectSelected(projects: KeyValuePair<number, string>[]): void {
    const projectsNames: string = projects.map((item: KeyValuePair<number, string>) => item.value).join(', ');
    const projectsIds: number[] = projects.map((item: KeyValuePair<number, string>) => item.key);

    this.selectedProjects = projects;
    this.projectsList = projects.map((project: KeyValuePair<number, string>) => project.value);

    this.uploadForm.controls.projects.patchValue(`${projectsNames}`);
    this.uploadForm.controls.projectIds.patchValue(projectsIds);
    this.uploadForm.updateValueAndValidity();
    this.uploadForm.markAsDirty();
  }

  public onClear(): void {
    this.uploadForm.patchValue({ projects: null, projectIds: null });
    this.uploadForm.updateValueAndValidity();
    this.uploadForm.markAsDirty();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private createOrUpdateTemplate(file: File): void {
    const request = { ...this.template, ...this.uploadForm.value } as CreateOrUpdateTemplateRequest;

    if (this.childComponent && this.childComponent.uploadDocusignForm) {
      this.updateRequestWithDocusignFields(request, this.childComponent.uploadDocusignForm);
    }

    request.documentId = this.template?.documentId || 0;
    if (file) {
      request.file = file;
      request.fileExtension = FileHelper.getExtension(this.selectedFile.name);
    }
    this.onTemplateCreateOrUpdate(request);
  }

  private updateRequestWithDocusignFields(request: CreateOrUpdateTemplateRequest, childFormValues: UntypedFormGroup): void {
    const emailListString: string = childFormValues.get('recipients').value;
    const emailListArray: string[] = emailListString?.split(';').map((email: string) => email.trim());

    const ccEmailListString: string = childFormValues.get('carbonCopies')?.value;
    const ccEmailListArray: string[] = ccEmailListString?.split(';').map((email: string) => email.trim());

    request.relatedDocumentTemplateId = this.uploadForm.get('documentStatusId').value === ClosingStatementDocumentStatusEnum.Inactive ? null : childFormValues.get('docuSignIntegrationTemplate').value;
    request.envelopeHeader = childFormValues.get('envelopeHeader').value;
    request.emailSubjectLine = childFormValues.get('emailSubjectLine').value;
    request.emailIntro = childFormValues.get('emailIntro').value;
    request.emailBody = childFormValues.get('emailBody').value;
    request.emailFooter = childFormValues.get('emailFooter').value;
    request.emailFooter = childFormValues.get('emailFooter').value;
    request.ccSignedDocuments = ccEmailListArray;
    request.recipients = emailListArray;
    request.electronicDeliveryProviderId = childFormValues.get('deliveryIntegrationProvider').value;
  }

  onEDeliveryStatusUpdate(isDisabled: boolean): void {
    this.eDeliveryUpdateDisabled = !!isDisabled;
  }
}
