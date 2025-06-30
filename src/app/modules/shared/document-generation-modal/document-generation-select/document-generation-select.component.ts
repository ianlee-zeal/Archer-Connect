import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import { IdValue } from '@app/models';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DocumentTemplate } from '@app/models/documents/document-generators/document-template';
import { OutputType } from '@app/models/enums/document-generation/output-type';
import { ValidationService } from '@app/services';
import * as fromShared from '../../state';
import { ValidationForm } from '../../_abstractions/validation-form';

const { sharedSelectors, sharedActions } = fromShared;

@Component({
  selector: 'app-document-generation-select',
  templateUrl: './document-generation-select.component.html',
  styleUrls: ['./document-generation-select.component.scss'],
})
export class DocumentGenerationSelectComponent extends ValidationForm implements OnInit {
  public readonly state$ = this.store.select(sharedSelectors.documentGenerationSelectors.root);
  public form: UntypedFormGroup;
  public ngUnsubscribe$ = new Subject<void>();
  public state;
  public readonly formFields = {
    template: 'template',
    watermark: 'watermark',
    outputFileName: 'outputFileName',
    outputFileNamingConvention: 'outputFileNamingConvention',
    outputFileType: 'outputFileType',
    outputType: 'outputType',
  };
  public defaultDocumentTemplate: DocumentTemplate;
  public readonly maxContentWidth = 400;

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly store: Store<fromShared.AppState>,
  ) {
    super();
  }

  ngOnInit() {
    this.form = this.getForm();
    this.state$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(item => {
      this.state = item;
    });

    let documentTemplates: DocumentTemplate[] = this.state.data.templates;

    if (documentTemplates) {
      if (this.state.defaultTemplateId) {
        this.defaultDocumentTemplate = documentTemplates.find(o => o.id == this.state.defaultTemplateId);
      } else {
        this.defaultDocumentTemplate = documentTemplates[0];
      }
      if (this.state.singleTemplate) {
        documentTemplates = documentTemplates.filter((template: DocumentTemplate) => template.name === this.state.singleTemplate);
        this.defaultDocumentTemplate = documentTemplates[0];
      }
    }
    this.setDataSelectedTemplate(this.defaultDocumentTemplate);
  }

  getForm(): UntypedFormGroup {
    return this.fb.group({
      template: this.getValidators(this.formFields.template),
      watermark: this.getValidators(this.formFields.watermark),
      outputFileName: this.getValidators(this.formFields.outputFileName),
      outputFileNamingConvention: this.getValidators(this.formFields.outputFileNamingConvention),
      outputFileType: this.getValidators(this.formFields.outputFileType),
      outputType: this.getValidators(this.formFields.outputType),
    });
  }

  getValidators(fieldName): Validators[] | null {
    let ControlValidators: Validators[] = [null];
    switch (fieldName) {
      case this.formFields.template:
        ControlValidators = [...ControlValidators, Validators.required];
        break;
      case this.formFields.watermark:
        break;
      case this.formFields.outputFileName:
        if (this.state?.currentData?.template?.outputFileNameSupported) ControlValidators = [...ControlValidators];
        break;
      case this.formFields.outputFileNamingConvention:
        if (this.state?.currentData?.template?.outputFileNamingConventionSupported && !this.state.isSingleExportMode) ControlValidators = [...ControlValidators, ValidationService.requiredAndNoWhitespaceBeforeTextValidator];
        break;
      case this.formFields.outputFileType:
        if (this.state?.currentData?.template?.outputFileTypeSupported) ControlValidators = [...ControlValidators, Validators.required];
        break;
      case this.formFields.outputType:
        ControlValidators = [...ControlValidators, Validators.required];
        break;
      default:
        return null;
    }

    return ControlValidators;
  }

  public onTemplateChange(value: IdValue): void {
    if (!value) {
      return;
    }

    this.form = this.getForm();
    const documentTemplate: DocumentTemplate = this.state.data.templates?.filter(item => item.id == value.id)[0];
    this.setDataSelectedTemplate(documentTemplate);
  }

  setDataSelectedTemplate(documentTemplate: DocumentTemplate) {
    const initialOutputTypeId = Array.isArray(this.state.data.outputTypeOptions)
      ? this.state.data.outputTypeOptions.filter(item => item.id === documentTemplate?.outputType)[0]
      : this.state.data.outputTypeOptions[0];

    const initialOutputFileType = Array.isArray(this.state.data.allOutputFileTypesOptions)
      ? this.state.data.allOutputFileTypesOptions.filter(item => item.id === documentTemplate?.outputFileType)[0]
      : this.state.data.allOutputFileTypesOptions[0];

    if (documentTemplate) {
      this.store.dispatch(sharedActions.documentGenerationActions.SetDataOnTemplateChange({ documentTemplate }));
      this.form = this.getForm();
      this.form.patchValue({
        template: documentTemplate,
        outputType: initialOutputTypeId ?? this.state.data.outputTypeOptions[0],
        outputFileType: initialOutputFileType ?? this.state.data.allOutputFileTypesOptions[0],
        outputFileNamingConvention: documentTemplate.outputFileNamingConvention,
      });
      this.form.updateValueAndValidity();
    }
    this.updateFormValidation();
    this.updateWatermarkType();
  }

  public onOrganizationChange($event): void {
    this.store.dispatch(sharedActions.documentGenerationActions.SetData({ data: { organization: { id: $event } } }));
  }

  public onChanges(): void {
    this.updateFormValidation();
  }

  updateFormValidation() {
    this.store.dispatch(sharedActions.documentGenerationActions.SetIsValidSelect({ isValidSelect: this.form.valid }));
  }

  public updateValidationOnInput() {
    this.updateFormValidation();
  }

  public onEditableFieldChange(event, formControlName): void {
    if (!event) {
      return;
    }

    let showWatermark = (this.state.currentData.outputTypeOption.id == OutputType.Draft);
    let watermark;
    if (this.state.currentData.outputTypeOption.id == OutputType.Draft) {
      watermark = this.form.get(this.formFields.watermark).value;
    } else {
      watermark = '';
    }

    switch (formControlName) {
      case this.formFields.outputType:

        if (event.id == OutputType.Draft && this.form.controls.template.value) {
          showWatermark = true;
        } else {
          showWatermark = false;
        }

        this.store.dispatch(sharedActions.documentGenerationActions.UpdateEditableFields({
          outputTypeOption: event,
          watermarkSupported: showWatermark,
          watermark,
        }));
        break;

      case this.formFields.outputFileType:
        this.store.dispatch(sharedActions.documentGenerationActions.UpdateEditableFields({
          outputFileTypeOption: event,
          watermarkSupported: showWatermark,
          watermark,
        }));
        break;
      default:
        this.store.dispatch(sharedActions.documentGenerationActions.UpdateEditableFields({
          watermark,
          outputFileName: this.form.get(this.formFields.outputFileName).value,
          outputFileNamingConvention: this.form.get(this.formFields.outputFileNamingConvention).value,
          watermarkSupported: showWatermark,
        }));
        break;
    }
  }

  private updateWatermarkType() {
    const outputType = this.form.get(this.formFields.outputType).value?.id;
    let showWatermark = (this.state.currentData.outputTypeOption.id == OutputType.Draft);
    let watermark;
    if (this.state.currentData.outputTypeOption.id == OutputType.Draft) {
      watermark = 'In Review';
    } else {
      watermark = '';
    }
    if (outputType == OutputType.Draft && this.form.controls.template.value) {
      showWatermark = true;
      this.form.controls[this.formFields.watermark].setValue(watermark);
    } else {
      showWatermark = false;
    }

    this.store.dispatch(sharedActions.documentGenerationActions.UpdateEditableFields({
      watermarkSupported: showWatermark,
      watermark,
    }));
  }
}
