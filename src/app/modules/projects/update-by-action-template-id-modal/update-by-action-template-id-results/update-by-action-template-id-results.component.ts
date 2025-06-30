import { Component, Input, OnInit } from '@angular/core';

import { FileImportTab } from '@app/models/file-imports';
import { FileImportReviewTabs } from '@app/models/enums';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import * as fromShared from '../../state';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';

@Component({
  selector: 'app-update-by-action-template-id-results',
  templateUrl: './update-by-action-template-id-results.component.html',
  styleUrls: ['./update-by-action-template-id-results.component.scss'],
})
export class UpdateByActionTemplateIdResultsComponent implements OnInit {
  @Input() public tabsGroup: FileImportTab[];
  @Input() public batchAction: BatchAction;
  @Input() public actionTemplateId: number;

  public activeTab = FileImportReviewTabs.AllRecords;
  public documentTypeId = BatchActionDocumentType.LoadingResults;
  public batchActionTemplates = BatchActionTemplate;

  protected readonly ngUnsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store: Store<fromShared.AppState>,
  ) { }

  ngOnInit(): void {

  }

  isActiveTab(item: FileImportTab) {
    return item.tab === this.activeTab;
  }

  onChangeTab(tab: FileImportReviewTabs) {
    this.activeTab = tab;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
