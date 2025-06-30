import { Component, OnDestroy, OnInit } from "@angular/core";
import { DocumentBatchState } from "../state/reducer";
import { Store } from "@ngrx/store";
import * as documentBatchSelectors from '@app/modules/document-batch/state/selectors';
import { DocumentBatchDetailsResponse } from "@app/models/document-batch-get/get-single-batch/document-batch-details-response";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { DateFormatPipe } from "@app/modules/shared/_pipes";

@Component({
    selector: 'app-document-batch-details-header',
    templateUrl: './document-batch-details-header.component.html',
    styleUrls: ['./document-batch-details-header.component.scss']
  })
  export class DocumentBatchDetailsHeaderComponent implements OnInit, OnDestroy {
    public readonly batchDetails$ = this.store.select(documentBatchSelectors.getBatchDetails);

    public batchDetails: DocumentBatchDetailsResponse;
    public project: string;
    public org: string;
    public createdDate: string;

    private destroy$: Subject<void> = new Subject<void>();

    constructor(
        private readonly store: Store<DocumentBatchState>,
        private readonly datePipe: DateFormatPipe,
        ){}

    ngOnInit(): void {
        this.batchDetails$
          .pipe(
            filter(batchDetails => batchDetails != null),
            takeUntil(this.destroy$)
          )
          .subscribe(batchDetails => {
            this.batchDetails = batchDetails;
            this.project = `${this.batchDetails.caseName}`;
            this.org = `${this.batchDetails.orgId} - ${this.batchDetails.orgName}`;
            this.createdDate = this.datePipe.transform(batchDetails.createdDate, false, 'MM/dd/YYYY h:mm a', null, null, false);
          });
      }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
  }