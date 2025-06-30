import { Component, OnInit, OnDestroy, Input, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { DocumentImport, DocumentImportTemplate } from '@app/models/documents';

import { distinctUntilChanged, filter, first, takeUntil } from 'rxjs/operators';
import { EntityTypeEnum, FileImportControlConfigTypes, FileImportTemplateTypes } from '@app/models/enums';
import { FileImportTemplateConfig } from '@app/models/file-imports/config/config-base';
import * as projectsSelector from 'src/app/modules/projects/state/selectors';
import { DisbursementGroupLight } from '@app/models/disbursement-group-light';
import { Project } from '@app/models';
import * as fromShared from '../../state';
import { ValidationForm } from '../../_abstractions/validation-form';

const { sharedActions, sharedSelectors } = fromShared;

@Component({
  selector: 'app-upload-bulk-document-configure',
  templateUrl: './upload-bulk-document-configure.component.html',
  styleUrls: ['./upload-bulk-document-configure.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UploadBulkDocumentConfigureComponent extends ValidationForm implements OnInit, OnDestroy {
  @Input() importTypeId: EntityTypeEnum;
  @Input() entityId: number;

  public readonly documentImportSelectedTemplate$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.selectedTemplate);
  public readonly disbursementGroups$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.disbursementGroups);
  public readonly documentImport$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.documentImport);

  public documentImport: DocumentImport;
  public documentImportTemplate: DocumentImportTemplate;
  public controlConfigTypes = FileImportControlConfigTypes;
  public disbursementGroupsOptions: DisbursementGroupLight[];
  public disbursementGroups: DisbursementGroupLight[];
  public form: UntypedFormGroup;
  public readonly searchFn = (): boolean => true;

  private readonly DoNotShowSelectDisbursementByTemplate: FileImportTemplateTypes[] = [
    FileImportTemplateTypes.Intake,
    FileImportTemplateTypes.SpecialPaymentInstructions,
    FileImportTemplateTypes.ClientOrganizationEntityAccess,
    FileImportTemplateTypes.FirmFeeAndExpense,
    FileImportTemplateTypes.LedgerArcherFees,
    FileImportTemplateTypes.ClientExternalIdentifiers,
  ];

  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private store: Store<fromShared.AppState>,
  ) {
    super();
  }

  ngOnInit(): void {
    this.documentImportSelectedTemplate$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter((x: DocumentImportTemplate) => !!x),
      )
      .subscribe((result: DocumentImportTemplate) => {
        this.documentImportTemplate = result;

        const importingDisbursementGroup: boolean = this.documentImportTemplate.id === FileImportTemplateTypes.DisbursementGroups;
        if (this.showDisbursementGroup() && this.entityId) {
          this.store.dispatch(sharedActions.uploadBulkDocumentActions.LoadDisbursementGroupsData({ entityId: this.entityId, removeProvisionals: importingDisbursementGroup }));
        }

        this.createForm();
      });

    this.disbursementGroups$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter((x: DisbursementGroupLight[]) => !!x),
      )
      .subscribe((result: DisbursementGroupLight[]) => {
        this.disbursementGroups = result;
        this.disbursementGroupsOptions = result;
        this.setDefaultDisbursementGroupOption();
      });

    this.documentImport$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter((x: DocumentImport) => !!x),
      )
      .subscribe((result: DocumentImport) => {
        this.documentImport = result;
      });
  }

  public getFormControlType(key: string): FileImportControlConfigTypes {
    return this.documentImportTemplate.config.getControlType(key);
  }

  public showDisbursementGroup(): boolean {
    return this.documentImportTemplate && !this.DoNotShowSelectDisbursementByTemplate.includes(this.documentImportTemplate.id);
  }

  public get isLedgerArcherFeesTemplate(): boolean {
    return this.documentImportTemplate && this.documentImportTemplate.id === FileImportTemplateTypes.LedgerArcherFees;
  }


  public onDocumentGroupChange(data: DisbursementGroupLight): void {
    if (!this.documentImport) {
      return;
    }
    this.documentImport = {
      ...this.documentImport,
      config: { ...this.documentImport?.config, groupId: data?.id, groupType: data?.typeId, caseId: this.entityId },
    };

    this.updateDocumentImportSettings(this.documentImport.config);
  }

  private createForm(): void {
    const config: FileImportTemplateConfig = this.documentImportTemplate.config;
    if (!config && !this.showDisbursementGroup() && !this.isLedgerArcherFeesTemplate) {
      return;
    }

    this.form = this.getFormGroup(config);
    if (this.isLedgerArcherFeesTemplate) {
      this.updateState();
    }
    this.form.valueChanges
      .pipe(
        distinctUntilChanged((a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(() => {
        this.updateState();
      });
  }

  private getFormGroup(config: FileImportTemplateConfig): UntypedFormGroup {
    let formGroup: any = {};
    if (this.showDisbursementGroup()) {
      formGroup.documentImportGroup = [null, Validators.required];
    }


    if (this.isLedgerArcherFeesTemplate) {
      formGroup.replaceAllValues = [false, Validators.required];
    }

    if (!Object.keys(formGroup).length) {
      formGroup = config.getControlsConfig();
    }

    return this.fb.group(formGroup);
  }

  private updateState(): void {
    if (!this.validationForm || !this.documentImport) {
      return;
    }

    if (this.showDisbursementGroup()) {
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.isValidGroupSelect({ isValidGroupSelect: super.validate() }));

      if (!this.documentImport.config?.caseId) {
        this.store.select(projectsSelector.item).pipe(
          first((x: Project) => !!x),
        ).subscribe((item: Project) => {
          this.documentImport = {
            ...this.documentImport,
            config: { ...this.documentImport.config, caseId: item.id },
          };
          this.updateDocumentImportSettings(this.documentImport.config);
        });
      }
    } else if (this.isLedgerArcherFeesTemplate) {
      this.documentImport = {
        ...this.documentImport,
        config: { ...this.documentImport.config, replaceAllValues: this.form.get('replaceAllValues').value },
      };

      this.updateDocumentImportSettings(this.documentImport.config);
    } else {
      this.updateDocumentImportSettings();
    }
  }

  private updateDocumentImportSettings(value = null): void {
    const documentImport: DocumentImport = {
      ...this.documentImport,
      config: { ...this.documentImport.config, ...(value ?? this.form.value) },
    };
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetDocumentImport({ documentImport }));
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.isValidGroupSelect({ isValidGroupSelect: super.validate() }));
  }


  private setDefaultDisbursementGroupOption(): void {
    this.form?.patchValue({ documentImportGroup: this.disbursementGroupsOptions[0] });
    this.onDocumentGroupChange(this.disbursementGroupsOptions[0]);
    this.updateState();
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
