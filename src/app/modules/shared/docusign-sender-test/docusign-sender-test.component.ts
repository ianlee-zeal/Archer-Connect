import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormGroup } from '@angular/forms';
import { DocumentTemplate } from '@app/models/documents/document-generators/document-template';
import { CreateOrUpdateTemplateRequest } from '@app/models/documents/document-generators/create-or-update-template-request';

import { TestCSGenerationRequest } from '@app/models/docusign-sender/test-cs-generation-request';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state';
import * as documentTemplateActions from '@app/modules/document-templates/state/actions';
import * as documentTemplatesSelectors from '@app/modules/document-templates/state/selectors';
import { DocumentType as DocumentTypeEnum } from '@app/models/enums/document-generation/document-type.enum';
import { Observable, Subject, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DocuSignMessage } from '@app/models/enums/docusign-sender/docusign-message.enum';
import { map } from 'rxjs/operators';
import { SelectOption } from '../_abstractions/base-select';
import { ClaimSettlementLedgerSettingsService } from '@app/services/api/claim-settlement-ledger-settings.service';
import { ElectronicDeliveryProvider } from '@app/models/enums/ledger-settings/electronicDeliveryProvider';

@Component({
    selector: 'app-docusign-sender-test',
    templateUrl: './docusign-sender-test.component.html',
    styleUrls: ['./docusign-sender-test.component.scss'],
  })
  export class DocuSignSenderTestComponent implements OnInit {
    @Input() template: CreateOrUpdateTemplateRequest;
    @Input() fromCreate: boolean;
    @Input() selectedFile: File;
    @Input() csUploadForm: FormGroup;
    @Output() testDITFileEvent = new EventEmitter<{templateId: number, request: TestCSGenerationRequest}>()
    @Output() eDeliveryUpdateStatus = new EventEmitter<boolean>();

    public readonly docuSignResponse$ = this.store.select(documentTemplatesSelectors.selectDocusignResponse);
    public documentTemplatesForDITs$: Observable<DocumentTemplate[]>
    public docuSignFieldsDefaults$ = this.store.select(documentTemplatesSelectors.getDocusignDefaults);
    public documentProvidersForDIPs$: Observable<SelectOption[]>;

    public uploadDocusignForm: UntypedFormGroup;
    public validationMessage: string;
    public tooltip = 'View Global Default Content';

    private updateAllowedSubject = new Subject<boolean>();
    public updateAllowed$ = this.updateAllowedSubject.asObservable();
    private isUpdateOrUpload = false;
    private previousDisabledState: boolean = true;

    constructor(
      private readonly formBuilder: UntypedFormBuilder,
      private readonly store: Store<AppState>,
      private readonly claimSettlementLedgerSettingsService: ClaimSettlementLedgerSettingsService,
    ) {

    }

    ngOnInit(): void {

      this.store.dispatch(documentTemplateActions.GetDocuSignTemplateDefaults());

      this.documentTemplatesForDITs$ = this.store.select(documentTemplatesSelectors.documentTemplatesDropdownValues(DocumentTypeEnum.DocusignIntegrationTemplate)).pipe(
        switchMap(documentTypes => {
          if (documentTypes !== undefined && documentTypes !== null) {
            var updatedTypes = [{ id: null, name: 'None' }, ...documentTypes];
            return of(updatedTypes);
          } else {
            return of([]);
          }
        })
      );

      this.documentProvidersForDIPs$ = this.claimSettlementLedgerSettingsService
           .getElectronicDeliveryProviders()
           .pipe(
               map(providers => [
                   ...providers
               ].map(provider => ({
                   id: provider.id,
                   name: provider.name
               })))
           );

      this.docuSignResponse$.subscribe(response => {
        if (response && response.docuSignMessage != null && response.hasError == true && !this.isUpdateOrUpload)  {
          this.validationMessage = response.docuSignMessage;
        }
        else if(response && response.docuSignMessage != null && response.hasError == true && this.isUpdateOrUpload) {
          this.validationMessage = response.docuSignMessage;
          this.updateAllowedSubject.next(false);
        }
        else if (response && response.docuSignMessage == null && response.hasError == false && this.isUpdateOrUpload) {
          this.updateAllowedSubject.next(true);
        }
        else if(response && response.docuSignMessage === DocuSignMessage.ValidationPassed && this.isUpdateOrUpload)
        {
          this.updateAllowedSubject.next(true);
        } else if(response && response.docuSignMessage === DocuSignMessage.PDFGenerated && this.isUpdateOrUpload)
        {
          this.updateAllowedSubject.next(true);
        }
        this.isUpdateOrUpload = false;
      });


      this.uploadDocusignForm = this.formBuilder.group({
        deliveryIntegrationProvider: [this.convertProviderIdToEnum(this.template.electronicDeliveryProviderId) || null],
        docuSignIntegrationTemplate: [this.template.relatedDocumentTemplateId || null],
        envelopeHeader: [this.template.envelopeHeader || null],
        emailSubjectLine: [this.template.emailSubjectLine || null],
        emailIntro: [this.template.emailIntro || null],
        emailBody: [this.template.emailBody || null],
        emailFooter: [this.template.emailFooter || null],
        carbonCopies: [this.template?.ccSignedDocuments ? this.template?.ccSignedDocuments.join(';') : null],
        recipients: [this.template?.recipients ? this.template?.recipients.join(';') : null],
      });

      const initialDisabledState = this.disableUpdateButton();
      this.eDeliveryUpdateStatus.emit(initialDisabledState);
      this.previousDisabledState = initialDisabledState;

      this.uploadDocusignForm.valueChanges.subscribe(() => {
        const isDisabled = this.disableUpdateButton();
        if (isDisabled !== this.previousDisabledState) {
          this.eDeliveryUpdateStatus.emit(isDisabled);
          this.previousDisabledState = isDisabled;
        }
      });
    }

    buildDocusignRequest(fromUploadOrUpdate: boolean): TestCSGenerationRequest {
      const emailListString: string = this.uploadDocusignForm.get('recipients').value;
      const emailListArray: string[] = emailListString?.split(';').map(email => email.trim());

      const ccEmailListString: string = this.uploadDocusignForm.get('carbonCopies')?.value;
      const ccEmailListArray: string[] = ccEmailListString?.split(';').map(email => email.trim());

      const request = new TestCSGenerationRequest(
        this.uploadDocusignForm.get('envelopeHeader').value,
        this.uploadDocusignForm.get('emailSubjectLine').value,
        this.uploadDocusignForm.get('emailIntro').value,
        this.uploadDocusignForm.get('emailBody').value,
        this.uploadDocusignForm.get('emailFooter').value,
        emailListArray,
        ccEmailListArray,
        fromUploadOrUpdate,
        this.csUploadForm.get('name').value
      );

      request.ditId = this.uploadDocusignForm.get('docuSignIntegrationTemplate').value;
      request.electronicDeliveryProviderId = this.uploadDocusignForm.get('deliveryIntegrationProvider').value;

      return request;
    }

    onTestDITFile(generateSample: boolean): void {
      this.validationMessage = null;

      const templateId = this.template.id;

      var request = this.buildDocusignRequest(false);

      if(this.fromCreate)
      {
        const reader = new FileReader();
        reader.onloadend = () => {
          const fileContentBase64 = reader.result as string;
          request.formFile = {
            fileName: this.selectedFile.name,
            content: fileContentBase64.split(',')[1]
          }
          if(generateSample == true)
            this.store.dispatch(documentTemplateActions.CSGenerateSample({request, templateId: null}));
          else
            this.testDITFileEvent.emit({templateId: null, request});
        }
        reader.readAsDataURL(this.selectedFile);
      }
      else {
        if(generateSample == true)
          this.store.dispatch(documentTemplateActions.CSGenerateSample({request, templateId}));
        else
        this.testDITFileEvent.emit({templateId, request});
      }
    }

    disableUpdateButton(): boolean {
      const providerControl = this.uploadDocusignForm.get('deliveryIntegrationProvider');
      const templateControl = this.uploadDocusignForm.get('docuSignIntegrationTemplate');

      const providerValue = providerControl?.value;
      const templateValue = templateControl?.value;

      // Allow if both are null/empty
      if (!providerValue && !templateValue) {
        return false;
      }

      // If one is set, require the other
      if ((providerValue && !templateValue) || (!providerValue && templateValue)) {
        return true;
      }

      return false;
    }

    onUpdateOrUpload(): Observable<void> {
      this.validationMessage = null;
      this.isUpdateOrUpload = true;

      if (this.disableUpdateButton()) {
        this.updateAllowedSubject.next(false);
        return of(null);
      }

      const templateId = this.template.id;
      const request = this.buildDocusignRequest(true);

      if (this.fromCreate) {
        return new Observable(observer => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const fileContentBase64 = reader.result as string;
            request.formFile = {
              fileName: this.selectedFile.name,
              content: fileContentBase64.split(',')[1]
            };
            this.testDITFileEvent.emit({templateId: null, request});
            observer.next();
            observer.complete();
          };
          reader.readAsDataURL(this.selectedFile);
        });
      } else {
        this.testDITFileEvent.emit({templateId, request});
        return of(null); // Return a completed observable for non-create scenario
      }
    }

    setValidationMessageToNull(): void {
      this.validationMessage = null;
    }

    disableTestButton(): boolean {
      const recipientsControl = this.uploadDocusignForm.get('recipients');
      const providerControl = this.uploadDocusignForm.get('deliveryIntegrationProvider');
      const templateControl = this.uploadDocusignForm.get('docuSignIntegrationTemplate');

      const recipientsValue = recipientsControl?.value;
      const trimmedRecipients = recipientsValue?.trim();
      const providerValue = providerControl?.value;
      const templateValue = templateControl?.value;

      const areValuesPresent = (
        recipientsValue !== null &&
        trimmedRecipients !== '' &&
        providerValue !== null &&
        templateValue !== null
      );

      return (this.fromCreate ? areValuesPresent && this.selectedFile !== undefined : areValuesPresent);
    }

    private convertProviderIdToEnum(id: number): ElectronicDeliveryProvider {
      return id as ElectronicDeliveryProvider;
    }

  }
