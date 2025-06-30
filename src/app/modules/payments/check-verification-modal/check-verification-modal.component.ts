import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { Subject } from 'rxjs';
import { FormInvalid } from '@app/modules/shared/state/common.actions';
import { ActionsSubject, Store } from '@ngrx/store';
import * as fromShared from '@app/state';
import { filter, takeUntil } from 'rxjs/operators';
import { sharedSelectors, sharedActions } from 'src/app/modules/shared/state/index';
import { Payment } from '@app/models/payment';
import { ofType } from '@ngrx/effects';
import { Attachment } from '@app/models/attachment';
import { FileHelper } from '@app/helpers/file.helper';
import { FileService, ValidationService } from '@app/services';
import { EntityTypeEnum } from '@app/models/enums';
import { Note } from '@app/models/note';
import { Phone } from '@app/models';
import { CheckVerification } from '@app/models/check-verification/check-verification';
import { AttachmentForm } from '@app/modules/shared/_abstractions/attachment-form';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';

@Component({
  selector: 'app-check-verification-modal',
  templateUrl: './check-verification-modal.component.html',
  styleUrls: ['./check-verification-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CheckVerificationModalComponent extends AttachmentForm implements OnInit, OnDestroy {
  public paymentId: number;
  public payment: Payment;
  public warningMsg: string;
  public editMode: boolean;
  public checkVerificationId: number;
  public checkVerification: CheckVerification;
  public attachmentEdited: boolean;

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  protected get isValidAttachment(): boolean {
    return this.attachmentEdited;
  }

  private ngUnsubscribe$ = new Subject<void>();

  public readonly payment$ = this.store.select(selectors.item);
  public readonly checkVerification$ = this.store.select(selectors.checkVerification);
  public allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);

  public readonly awaitedActionTypes = [
    actions.SubmitCheckVerificationComplete.type,
    actions.Error.type,
    FormInvalid.type,
  ];

  public form: UntypedFormGroup = new UntypedFormGroup({
    financialInstitution: new UntypedFormControl(null, [Validators.required, Validators.maxLength(50), ValidationService.noWhitespaceBeforeTextValidator]),
    agentsName: new UntypedFormControl(null, [Validators.required, Validators.maxLength(50), ValidationService.noWhitespaceBeforeTextValidator]),
    phone: new UntypedFormControl(null, [Validators.required, ValidationService.noWhitespaceBeforeTextValidator]),
    notes: new UntypedFormControl(null),
  });

  constructor(
    public modal: BsModalRef,
    private readonly store: Store<fromShared.AppState>,
    private readonly actionsSubj: ActionsSubject,
  ) {
    super();
  }

  public get validFormOnEdit() {
    return this.form.dirty || !this.form.pristine || this.isValidAttachment;
  }

  ngOnInit(): void {
    if (this.editMode) {
      this.subscribeToCheckVerification();
      this.store.dispatch(actions.GetCheckVerificationDetails({ id: this.checkVerificationId }));
    }
    this.dispatchActions();
    this.subscribeToPayment();

    this.actionsSubj.pipe(
      ofType(actions.SubmitCheckVerificationComplete),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.modal.hide();
      this.store.dispatch(actions.GetPaymentDetails({ paymentId: this.paymentId }));
    });
  }

  private dispatchActions() {
    this.store.dispatch(sharedActions.commonActions.GetMimeTypes());
  }

  private subscribeToPayment() {
    this.payment$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(data => !!data),
    ).subscribe(data => {
      this.payment = data;
    });
  }

  private subscribeToCheckVerification() {
    this.checkVerification$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(data => !!data),
    ).subscribe(data => {
      this.checkVerification = data;
      this.paymentId = this.checkVerification.paymentId;
      this.form.patchValue({
        financialInstitution: this.checkVerification.financialInstitution,
        agentsName: this.checkVerification.agentsName,
        phone: this.checkVerification.phone?.number,
        notes: this.checkVerification.note?.html,
      });
      this.attachmentEdited = false;
      this.attachments = this.checkVerification.attachments;
    });
  }

  onSubmit() {
    this.submitRequest();
  }

  private submitRequest() {
    const value = this.form.value;

    const checkVerification = {
      id: this.checkVerification?.id,
      paymentId: this.paymentId,
      agentsName: value.agentsName,
      financialInstitution: value.financialInstitution,
      attachments: this.attachments,
      note: Note.toDto({ html: value.notes, entityTypeId: EntityTypeEnum.CheckVerification, entityId: 0 } as Note),
      phone: { number: value.phone } as Phone,
    };

    this.store.dispatch(actions.SubmitCheckVerification({ checkVerification }));
  }

  onCancel() {
    this.modal.hide();
  }

  onFileSelected(file: File): void {
    this.attachmentEdited = true;
    super.onFileSelected(file);
  }

  protected convertToAttachment(file: File): Attachment {
    const fileName = file.name;
    const extension = FileHelper.getExtension(fileName);
    const attachment = new Attachment();
    attachment.name = FileHelper.extractFileName(fileName, extension);
    attachment.fileName = fileName;
    attachment.fileExtension = extension;
    FileService.fileToByteArray2(file).then(content => { attachment.fileContent = content; });
    return attachment;
  }

  public onRemoveSelectedFile(attachment: Attachment): void {
    this.attachmentEdited = true;
    super.onRemoveSelectedFile(attachment);
  }

  public onDownloadDocument(id: number) {
    this.store.dispatch(sharedActions.documentsListActions.DownloadByDocumentLinkId({ id }));
  }

  protected closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
  }

  ngOnDestroy() {
    this.store.dispatch(actions.ResetCheckVerification());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
