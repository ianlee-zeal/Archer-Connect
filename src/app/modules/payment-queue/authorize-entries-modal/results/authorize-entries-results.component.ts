import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { GridApi } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { ActionsSubject } from '@ngrx/store';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { Router } from '@angular/router';
import { FileImportReviewTabs } from '@app/models/enums';
import { FileImportTab } from '@app/models/file-imports';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { AuthorizeArcherFeesData } from '@app/models';

@Component({
  selector: 'app-authorize-entries-results',
  templateUrl: './authorize-entries-results.component.html',
  styleUrls: ['./authorize-entries-results.component.scss'],
})
export class AuthorizeEntriesResultsComponent implements OnDestroy, OnInit {
  @Input() public tabsGroup: FileImportTab[];
  @Input() public batchAction: BatchAction;
  public data: AuthorizeArcherFeesData[];

  public activeTab = FileImportReviewTabs.AllRecords;
  public documentTypeId = BatchActionDocumentType.PreviewValidation;

  protected gridApi: GridApi;

  protected ngUnsubscribe$ = new Subject<void>();

  public enabledAutoHeight: boolean = false;
  public skipSetContentHeight: boolean = true;
  public isContentAutoHeight: boolean = true;

  isActiveTab(item: FileImportTab): boolean {
    return item.tab === this.activeTab;
  }

  public ngOnInit(): void {

  }

  public onChangeTab(tab: FileImportReviewTabs): void {
    this.activeTab = tab;
  }

  constructor(
    protected router: Router,
    protected elementRef: ElementRef,
    private actionsSubj: ActionsSubject,
  ) {
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
