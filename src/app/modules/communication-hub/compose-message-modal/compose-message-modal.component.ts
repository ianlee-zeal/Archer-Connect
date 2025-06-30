import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ValidationForm } from '@shared/_abstractions/validation-form';
import { FormBuilder, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as actions from '../state/actions';
import { filter, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { IconHelper, SearchOptionsHelper } from '@app/helpers';
import { Project } from '@app/models';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { FilterModelOperation } from '@app/models/advanced-search/filter-model-operation.enum';
import { JiraFieldRenderTypeEnum, JiraFieldRenderTypeHelper } from '@app/models/jira/jira-field-render-type.enum';
import { QuillImageDropAndPaste } from '@app/modules/communication-hub/jira-quilljs-image.helper';
import { CommunicationHubState } from '@app/modules/communication-hub/state/reducer';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { QuillModules } from 'ngx-quill';
import Quill from 'quill';
import { distinctUntilChanged } from 'rxjs/operators';
import { FormDataHelper } from '@app/helpers/form-data.helper';
import { JiraMarkupHelper } from '@app/modules/communication-hub/jira-markup.helper';
import * as selectors from '../state/selectors';
import { FileValidatorService, PermissionService } from '@app/services';
import { CommunicationHubService } from '@app/services/api/communication-hub.service';
import { UploadTile } from '@app/models/jira/jira-upload-tile';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { JiraFileUploaderComponent } from '@shared/jira-file-uploader/jira-file-uploader.component';
// @ts-ignore
Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste);

@Component({
  selector: 'app-compose-message-modal',
  templateUrl: './compose-message-modal.component.html',
  styleUrl: './compose-message-modal.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ComposeMessageModalComponent extends ValidationForm implements OnDestroy, OnInit {
  protected readonly JiraFieldRenderTypeHelper = JiraFieldRenderTypeHelper;
  private ngUnsubscribe$ = new Subject<void>();
  EXCLUDED_FIELD_IDS = ['description', 'summary', 'projectId', 'projectName'];

  @ViewChild(JiraFileUploaderComponent) fileUploader?: JiraFileUploaderComponent;
  private fileCount: number = 0;
  public exceedsFileLimit: boolean = false;
  private composeFiles: UploadTile[] = [];
  private readonly maxFileSize: number = 50 * 1024 * 1024;
  public canAttachFiles = this.permissionService.has(PermissionService.create(PermissionTypeEnum.ANDIMessaging, PermissionActionTypeEnum.ANDIAttachments));

  UNSUPPORTED_FIELD_TYPES = [
    JiraFieldRenderTypeEnum.FileUpload,    // Not supported in frontend yet
    JiraFieldRenderTypeEnum.DatePicker,    // Single Date fields not supported
    JiraFieldRenderTypeEnum.DateTimePicker, // DateTime fields not supported
    JiraFieldRenderTypeEnum.Unknown
  ];

  @Output() public onSubmit = new EventEmitter<any>();

  fields$ = this.store.select(selectors.composeFields);
  projects$ = this.store.select(selectors.projectsList);
  loadingProjects$ = this.store.select(selectors.isLoading);

  participants$ = this.store.select(selectors.participants);
  agents$ = this.store.select(selectors.agents);
  jiraMarkupHelper = new JiraMarkupHelper();

  listFields: any[] = [];

  defaultFieldsForm: FormGroup = this.fb.group({
    summary: ['', Validators.required],
    rawDescription: [''],
    requestType: ['', Validators.required],
    projectId: [''],
    projectName: [''],
    participants: [''],
  });

  requestTypeFieldsForm: FormGroup = this.fb.group({});

  requestTypes: any;

  editorModules: QuillModules = JiraMarkupHelper.editorModules;

  constructor(
    private readonly store: Store<CommunicationHubState>,
    public modalRef: BsModalRef,
    private fb: FormBuilder,
    private readonly fileValidatorService: FileValidatorService,
    private readonly communicationHubService: CommunicationHubService,
    private permissionService: PermissionService,
  ) {
    super();
  }

  ngOnInit() {
    this.store.dispatch(actions.GetAgents());
    this.store.dispatch(actions.GetParticipants({}));
    this.fields$.pipe(
      filter(fields => Array.isArray(fields) && fields.length > 0),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      takeUntil(this.ngUnsubscribe$)
    ).subscribe(fields => {
      this.listFields = this.createNewForm(fields);
    });

    this.projectFilterFetch('');
  }

  protected get getComposeFiles(): UploadTile[] {
    return this.composeFiles;
  }

  protected get validationForm(): UntypedFormGroup {
    return this.defaultFieldsForm;
  }

  public get isValidForm(): boolean{
    if (this.defaultFieldsForm.invalid || this.requestTypeFieldsForm.invalid) {
      return false;
    }

    if (this.composeFiles.length > 0) {
      const anyInFlight = this.composeFiles
        .some(tile => tile.status === 'pending' || tile.status === 'uploading'
          || tile.status === 'error');
      if (anyInFlight) {
        return false;
      }
    }

    return true;
  }

  public onCancel(): void {
    this.defaultFieldsForm.reset();
    this.requestTypeFieldsForm.reset();
    this.modalRef.hide();
    this.clearComposeFiles();
  }

  onRequestTypeSelect(event: any): void {
    this.defaultFieldsForm.controls.requestType.setValue(event.id);
    this.store.dispatch(actions.GetJiraRequestTypeFields({ requestTypeId: event.id }));
  }

  private createNewForm(fields: any[]) {
    const formControls: { [key: string]: UntypedFormControl } = {};

    const existingValues = this.requestTypeFieldsForm.value;

    const descriptionField = fields.find(field => field.id === 'description');
    if (descriptionField) {
      formControls['description'] = new UntypedFormControl(
        existingValues['description'] || '',
        descriptionField.required ? [Validators.required] : []
      );
    }

    const filteredFields = fields.filter(field =>
      !this.EXCLUDED_FIELD_IDS.includes(field.id) &&
      !this.UNSUPPORTED_FIELD_TYPES.includes(field.jiraFieldType)
    );


    filteredFields.forEach(field => {
      const existingValue = existingValues[field.id];
      const defaultValue = field[field.defaultItemId]?.value ?? '';

      formControls[field.id] = new UntypedFormControl(
        existingValue || defaultValue,
        field.required ? [Validators.required] : []
      );
    });

    this.requestTypeFieldsForm = this.fb.group(formControls);

    this.requestTypeFieldsForm.updateValueAndValidity();

    if (Object.keys(existingValues).length > 0) {
      this.requestTypeFieldsForm.markAsTouched();
    }
    this.updateDescriptionFormat();

    return filteredFields;
  }

  updateField(formGroup: FormGroup, fieldKey: any, fieldType: JiraFieldRenderTypeEnum, event: any, selectValueField: string = 'value'): void {
    if (fieldType === JiraFieldRenderTypeEnum.MultiSelect) {
      formGroup.controls[fieldKey].setValue(
        event.map(item => item[selectValueField]).join(', '));
    } else if (fieldType === JiraFieldRenderTypeEnum.SingleSelect) {
      formGroup.controls[fieldKey].setValue(event ? event[selectValueField] : '');
    } else {
      formGroup.controls[fieldKey].setValue(event);
    }
  }

  getDefaultOption(field: any): any {
    return field.items?.find(i => i.key === field.defaultItemId) || null;
  }

  onSend(): void{
    if (this.defaultFieldsForm.valid && this.requestTypeFieldsForm.valid) {

      const rawRequestTypeFields = this.requestTypeFieldsForm.getRawValue();
      const filteredRequestTypeFields = Object.entries(rawRequestTypeFields)
        .filter(([_, value]) => value !== '')
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>);

      const projectId = this.defaultFieldsForm.controls.projectId.value;
      const projectName = this.defaultFieldsForm.controls.projectName.value;

      const data = {
        requestTypeId: this.defaultFieldsForm.controls.requestType.value,
        requestParticipants: this.defaultFieldsForm.controls.participants.value?.trim()
          ? this.defaultFieldsForm.controls.participants.value.split(',').map(x => x.trim())
          : [],
        additionalFields: {
        },
        requestFieldValues: {
          summary: this.defaultFieldsForm.controls.summary.value,
          ...filteredRequestTypeFields,
        },
        temporaryAttachmentIds: this.composeFiles
          .filter(file => file.fileUploadedId != null)
          .map(file   => file.fileUploadedId)
      };

      projectId !== '' && (data.additionalFields['projectId'] = projectId);
      projectName !== '' && (data.additionalFields['projectName'] = projectName);

      const descriptionInJiraMarkup = this.jiraMarkupHelper.parseHtmlToMarkdown(this.defaultFieldsForm.value.rawDescription);

      if (this.defaultFieldsForm.get('rawDescription').hasValidator(Validators.required)) {
        data.requestFieldValues['description'] = descriptionInJiraMarkup;
      } else {
        descriptionInJiraMarkup !== '' && (data.additionalFields['description'] = descriptionInJiraMarkup);
      }

      const formData = FormDataHelper.objectToFormData(data) as FormData;
      this.store.dispatch(actions.CreateJiraMessage({ data: formData }));
      this.onSubmit.emit();
      this.defaultFieldsForm.reset();
      this.requestTypeFieldsForm.reset();
      this.modalRef.hide();
      this.clearComposeFiles();
    }
  }

  updateDescriptionFormat(): void {
    const descriptionInJiraMarkup = this.jiraMarkupHelper.parseHtmlToMarkdown(this.defaultFieldsForm.value.rawDescription);

    if (this.requestTypeFieldsForm.controls['description']) {
      this.requestTypeFieldsForm.controls['description'].setValue(descriptionInJiraMarkup);
    }
  }


  // Code for projects input field
  public projectFilterFetch(term: string): void {
    const conditions: FilterModel[] = [];
    if (term) {
      conditions.push(SearchOptionsHelper.getContainsFilter('name', 'text', 'contains', term));

      if (!Number.isNaN(Number.parseInt(term, 10))) {
        conditions.push(SearchOptionsHelper.getNumberFilter('id', 'number', 'equals', parseInt(term, 10)));
      }
    }

    const search: IServerSideGetRowsRequestExtended = {
      endRow: 25,
      startRow: 0,
      rowGroupCols: [],
      valueCols: [],
      pivotCols: [],
      pivotMode: false,
      groupKeys: [],
      filterModel: conditions.length > 0
        ? [new FilterModel({ operation: FilterModelOperation.Or, conditions })]
        : [],
      sortModel: [{ sort: 'asc', colId: 'name' }],
    };
    this.store.dispatch(actions.GetProjectsRequest({ search }));
  }

  // Code for projects input field
  public onSelectedProject(project: Project): void {
    if (project.name) {
      this.defaultFieldsForm.controls.projectId.setValue(project.id);
      this.defaultFieldsForm.controls.projectName.setValue(project.name);
    }
  }

  ngOnDestroy() {
    this.store.dispatch(actions.ClearJiraRequestTypeFields());
    this.defaultFieldsForm.reset();
    Object.keys(this.requestTypeFieldsForm.controls).forEach(key => {
      this.requestTypeFieldsForm.removeControl(key);
    });
    this.clearComposeFiles();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  participantsFilterFetch(term: string) {
    this.store.dispatch(actions.GetParticipants(term ? { searchTerm: term } : {}));
  }

  onFilesSelected(tiles: UploadTile[]) {
    this.composeFiles = tiles;
  }

  private clearComposeFiles(): void {
    this.composeFiles = [];
    this.fileUploader?.clearFiles();
  }

  protected readonly JiraFieldRenderTypeEnum = JiraFieldRenderTypeEnum;
  protected readonly IconHelper = IconHelper;
}