import { Component, Input, OnInit } from '@angular/core';

import { FileImportTab } from '@app/models/file-imports';
import { FileImportDocumentType, FileImportReviewTabs } from '@app/models/enums';
import { DocumentImport } from '@app/models/documents';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromShared from '../../state';

const { sharedSelectors } = fromShared;

@Component({
  selector: 'app-upload-bulk-document-grids',
  templateUrl: './upload-bulk-document-grids.component.html',
  styleUrls: ['./upload-bulk-document-grids.component.scss'],
})
export class UploadBulkDocumentGridsComponent implements OnInit {
  public documentImport: DocumentImport;
  @Input() public tabsGroup: FileImportTab[];
  @Input() public documentTypeId: FileImportDocumentType;

  public documentImport$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.documentImport);

  public activeTab = FileImportReviewTabs.AllRecords;

  protected readonly ngUnsubscribe$: Subject<void> = new Subject<void>();

  public navItemclass(item: FileImportTab) {
    return {
      'error-active': this.isErrorTabActive(item),
      'deleted-active': this.isDeletedTab(item),
      active: this.isActiveTab(item),
    };
  }

  constructor(
    private store: Store<fromShared.AppState>,
  ) { }

  ngOnInit(): void {
    this.documentImport$.pipe(
      filter(x => !!x && !!x.id),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => {
      this.documentImport = result;
    });
  }

  isActiveTab(item: FileImportTab) {
    return item.tab === this.activeTab && this.documentImport?.id;
  }

  isDeletedTab(item: FileImportTab) {
    return this.documentImport?.id && item.tab === FileImportReviewTabs.Deleted && item.count > 0;
  }

  isErrorTabActive(item: FileImportTab) {
    return this.documentImport?.id && item.tab === FileImportReviewTabs.Errors && item.count > 0;
  }

  onChangeTab(tab: FileImportReviewTabs) {
    this.activeTab = tab;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
