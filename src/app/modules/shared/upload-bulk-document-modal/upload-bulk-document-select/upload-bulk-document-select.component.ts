import { Component, OnInit, OnDestroy } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';
import { combineLatest, Subject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import { DocumentImport, DocumentImportTemplate } from '@app/models/documents';
import { IdValue } from '@app/models';
import { TemplateCategories } from '@app/models/enums/template-categories.enum';
import * as fromShared from '../../state';
import { ValidationForm } from '../../_abstractions/validation-form';

const { sharedSelectors, sharedActions } = fromShared;

@Component({
  selector: 'app-upload-bulk-document-select',
  templateUrl: './upload-bulk-document-select.component.html',
  styleUrls: ['./upload-bulk-document-select.component.scss'],
})
export class UploadBulkDocumentSelectComponent extends ValidationForm implements OnInit, OnDestroy {
  public form: UntypedFormGroup;
  public readonly data$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.data);
  public readonly documentImport$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.documentImport);
  public readonly documentImportTemplate$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.selectedTemplate);
  public filteredTemplates: DocumentImportTemplate[];
  public templates: DocumentImportTemplate[];
  public templateCategories: IdValue[];
  public documentImport: DocumentImport;

  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  public get isProbateCategory() : boolean {
    if (!this.form) {
      return false;
    }

    return this.form.get('templateCategory').value?.id === TemplateCategories.Probate;
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get isDisabledTemplateSelect(): boolean {
    return !this.form.controls.templateCategory.value;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private store: Store<fromShared.AppState>,
  ) {
    super();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  ngOnInit() {
    this.createForm();
    combineLatest([
      this.data$,
      this.documentImport$,
      this.documentImportTemplate$,
    ]).pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(([data, documentImport, documentImportTemplate]) => !!data && (!!documentImport || !!documentImportTemplate)),
    ).subscribe(([data, documentImport, documentImportTemplate]) => {
      this.documentImport = documentImport;
      this.templates = data.templates;
      this.templateCategories = data.templateCategories;
      if (documentImportTemplate) {
        const selectedTemplate = documentImportTemplate.id ? this.templates.find((x: DocumentImportTemplate) => x.id === documentImportTemplate.id) : this.getDefaultTemplate();
        this.form.patchValue({ config: selectedTemplate.config, templateCategory: selectedTemplate.templateCategoryId, documentImportType: selectedTemplate });

        this.documentImport.templateId = selectedTemplate.id;
        this.documentImport.templateName = selectedTemplate.name;
        const config = this.documentImport.config ?? selectedTemplate.config
        this.documentImport.config = { ...config, caseId: this.documentImport.entityId };
      }
    });
  }

  ngAfterInit(): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetDocumentImport({ documentImport: this.documentImport }));
  }

  private getDefaultTemplate() {
    if (this.templateCategories.length !== 1) {
      return null;
    }

    const templateCategory = this.templateCategories[0];
    this.form.patchValue({ templateCategory });

    this.filteredTemplates = this.templates.filter(item => item.templateCategoryId === templateCategory.id);
    const defaultTemplate = this.filteredTemplates.find(item => item.isPrimary) || this.filteredTemplates[0];

    if (defaultTemplate) {
      this.onDocumentImportTemplateChange(defaultTemplate);
      return defaultTemplate;
    }
    return null;
  }

  private createForm() {
    this.form = this.fb.group({
      documentImportType: [null, Validators.required],
      templateCategory: [null, Validators.required],
      isUpdate: [false],
    });

    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.updateState();
      });
  }

  private updateState(): void {
    if (!super.validate()) {
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.IsValidSelect({ isValidSelect: false }));
    } else {
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.IsValidSelect({ isValidSelect: true }));
    }
  }

  public onDocumentImportTemplateChange(selectedTemplate: DocumentImportTemplate): void {
    if (!selectedTemplate) {
      return;
    }

    const documentImport: DocumentImport = {
      ...this.documentImport,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      config: { ...selectedTemplate.config, caseId: this.documentImport.entityId },
    };

    this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetDocumentImport({ documentImport }));
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetDocumentImportTemplate({ selectedTemplate }));
  }

  public onTemplateCategoryChange(selectedCategory: IdValue): void {
    if (!selectedCategory) {
      this.form.controls.documentImportType.setValue(null);
      return;
    }
    this.filteredTemplates = this.templates.filter(item => item.templateCategoryId === selectedCategory.id);
    const defaultTemplate = this.filteredTemplates.find(item => item.isPrimary) || this.filteredTemplates[0];
    if (defaultTemplate) {
      this.form.controls.documentImportType.setValue(defaultTemplate);
      this.onDocumentImportTemplateChange(defaultTemplate);
    }
  }

  public onCheckboxChange() {
    const isUpdate = this.form.get('isUpdate').value;

    this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetDocumentImport({
      documentImport: {
        ...this.documentImport,
        config: { ...this.documentImport.config, isUpdate },
      },
    }));
  }
}
