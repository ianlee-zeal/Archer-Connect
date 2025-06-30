import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DocumentImportTemplate } from '@app/models/enums/document-import-template.enum';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { sharedActions } from '@app/modules/shared/state';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-upload-template-and-attachments-step',
  templateUrl: './upload-template-and-attachments-step.component.html',
  styleUrls: ['./upload-template-and-attachments-step.component.scss', '../../manual-payment-request.component.scss'],
})
export class UploadTemplateAndAttachmentsStepComponent extends ValidationForm implements OnInit, OnDestroy {
  templateAndAttachmentsForm: UntypedFormGroup;
  private readonly ngUnsubscribe$ = new Subject<void>();
  @Input() projectName: string;
  @Input() qsfName: string;
  @Input() showError: boolean = false;

  public inputWidth = 298;
  public leftInputLabelWidth = 173;
  public rightInputLabelWidth = 202;

  public paymentDetailsFile: File;
  public additionalDocumentsFiles: File[] = [];
  public errorMessage: string = "*Invalid Template, please upload current Manual Payment Details template via the ‘Upload Payment Detail’ button";

  protected get validationForm(): UntypedFormGroup {
    return this.templateAndAttachmentsForm;
  }

  get valid(): boolean {
    return (!this.templateAndAttachmentsForm || this.templateAndAttachmentsForm.valid);
  }

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    private readonly formBuilder: UntypedFormBuilder,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initEmptyForm();
  }

  public downloadTemplate(): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.DownloadTemplate({ id: DocumentImportTemplate.ManualPaymentRequest }));
  }

  private initEmptyForm(): void {
    this.templateAndAttachmentsForm = this.formBuilder.group({
      projectId: [null, Validators.required],
      project: [''],
      qsfId: [null, Validators.required],
      qsf: [''],
    });
  }

  onPaymentDetailsFileSelected(files: File[]): void {
    this.paymentDetailsFile = files[0] || null;
  }

  onAdditionalDocumentsFilesSelected(files: File[]): void {
    this.additionalDocumentsFiles = files;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
