import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateBatchRequest } from '@app/models/document-batch-upload/create-batch/create-batch-request';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ModalService, ToastService } from '@app/services';
import { DocumentBatchUploadSettings } from '@app/models/document-batch-upload/document-batch-upload-settings/document-batch-upload-settings';
import * as documentBatchActions from '../state/actions';
import * as selectors from '../state/selectors';
import { DocumentBatchState } from '../state/reducer';
import { Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FilterModelOperation } from '@app/models/advanced-search/filter-model-operation.enum';
import { SearchOptionsHelper } from '@app/helpers';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { DocumentbatchModalComponent } from '../document-batch-modal/document-batch-modal.component';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FileHelper } from '@app/helpers/file.helper';

@Component({
  selector: 'app-document-batch-view',
  templateUrl: './document-batch-view.component.html',
  styleUrls: ['./document-batch-view.component.scss'],
})
export class DocumentBatchViewComponent implements OnInit, OnDestroy {

  public selectedFiles: File[] = [];
  documentBatchUploadSettings$ = this.store.select(selectors.documentBatchUploadSettings);
  documentBatchUploadSettings: DocumentBatchUploadSettings;
  selectedDepartmentOptions: SelectOption[] = [];

  projects$ = this.store.select(selectors.projectOptions);
  projects: SelectOption[];
  projectsLoading$ = this.store.select(selectors.projectOptionsLoading);
  projectsLoading: boolean = false;

  selectedProjectId: number | null = null;
  selectedDepartments: SelectOption[] = [];
  batchDescription: string | null = null;

  isModalVisible = false;

  private ngUnsubscribe$ = new Subject<void>();

  public actionBarActionHandlers: ActionHandlersMap = {
    cancel: {
      callback: () => this.cancelBatch(),
    },
  };

  constructor(
    private readonly store: Store<DocumentBatchState>,
    private modalService: ModalService,
    private toaster: ToastService,
    protected router: Router,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(documentBatchActions.getDocumentBatchUploadSettings());
    this.subscribeToSettings();
    this.subscribeToProjects();
    this.subscribeToCreatedBatchId();
    this.subscribeToModalVisibility();
  }

  cancelBatch(): void {
    this.router.navigate(['/document-batches']);
  }

  selectFiles(files: File[]): void {
    for (const file of files) {
      if (this.selectedFiles.length >= this.documentBatchUploadSettings.maxNumFiles) {
        this.toaster.showError('You have exceeded the 250 file per batch upload limit.  Please reduce the number of files in this batch.');
        break;
      }
      if (file.size > this.documentBatchUploadSettings.maxFileSizeInBytes) {
        this.toaster.showError(`This file exceeds the size limit of ${FileHelper.bytesToMegabytes(this.documentBatchUploadSettings.maxFileSizeInBytes)} MB`);
        continue;
      }
      this.selectedFiles = [...this.selectedFiles, file];
    };
  }

  handleFileRemoved(removedFile: File): void {
    this.selectedFiles = this.selectedFiles.filter(file => file !== removedFile);
  }

  uploadFiles(batchId: number) {
    for (const file of this.selectedFiles) {
      const isFinal = this.selectedFiles.indexOf(file) === this.selectedFiles.length - 1;
      this.store.dispatch(documentBatchActions.uploadFile({ file, batchId, isFinal }));
    }
  }

  createBatch() {
    if (!this.isValid()) {
      this.toaster.showError('Please fill out all required fields');
      return;
    }

    const batchRequest: CreateBatchRequest = {
      caseId: this.selectedProjectId,
      description: this.batchDescription,
      departmentIds: this.selectedDepartments.map(department => Number(department.id)),
    };
    this.store.dispatch(documentBatchActions.createBatch({ createBatchRequest: batchRequest }));

  }

  updateSelectedDocumentTypes(value: SelectOption[]): void {
    this.selectedDepartments = value;
    this.selectedDepartmentOptions = this.selectedDepartmentOptions.map(
      item => ({ ...item, checked: value.includes(item) })
    );
  }

  subscribeToSettings(): void {
    this.documentBatchUploadSettings$
      .pipe(
        filter(settings => !!settings),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(settings => {
        this.documentBatchUploadSettings = { ...settings };
        this.selectedDepartmentOptions = [...settings.departments];
      });
  }

  public fetch(term: string): void {
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
    this.store.dispatch(documentBatchActions.GetProjectOptionsRequest({ search }));
  }

  subscribeToProjects(): void {
    this.projects$
      .pipe(
        filter((x: SelectOption[]) => !!x),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((projects: SelectOption[]) => {
        this.projects = [...projects];
      });
    this.projectsLoading$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((inProgress: boolean) => {
        this.projectsLoading = inProgress;
      });
  }

  subscribeToCreatedBatchId(): void {
    this.store.select(selectors.createdBatchId)
      .pipe(
        filter(id => !!id),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(createdBatchId => {
        if (!this.isModalVisible) {
          this.isModalVisible = true;
          this.store.dispatch(documentBatchActions.createUploadTask({ files: this.selectedFiles, batchId: createdBatchId }));

          this.modalService.show(DocumentbatchModalComponent, {
            class: 'document-batch-modal',
          });

          this.uploadFiles(createdBatchId);

        }
      });
  }

  subscribeToModalVisibility(): void {
    this.modalService.onHidden
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.isModalVisible = false;
        this.selectedFiles = [];
        this.router.navigate(['/document-batches']);
      });
  }

  public searchFn(): boolean {
    return true;
  }

  isValid(): boolean {
    return this.selectedProjectId !== null && this.selectedFiles.length > 0 && this.batchDescription !== null;
  }

  ngOnDestroy(): void {
    this.store.dispatch(documentBatchActions.reset());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
