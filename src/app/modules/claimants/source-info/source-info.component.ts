import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { KeyValue } from '@app/models';
import * as selectors from '../claimant-details/state/selectors';
import * as actions from '../claimant-details/state/actions';
import { ClaimantDetailsState } from '../claimant-details/state/reducer';

@Component({
  selector: 'app-source-info',
  templateUrl: './source-info.component.html',
  styleUrls: ['./source-info.component.scss'],
})
export class SourceInfoComponent implements OnInit, OnDestroy {
  protected ngUnsubscribe$ = new Subject<void>();
  public item$ = this.store.select(selectors.item);
  public dataSourceIsLoaded$ = this.store.select(selectors.dataSourceIsLoaded);
  public headerBlocks: KeyValue[];
  public lastLoadedDate: Date;

  constructor(
    private store: Store<ClaimantDetailsState>,
    private route: ActivatedRoute,
  ) { }

  public ngOnInit(): void {
    const productCategory = this.route.snapshot.data.category;
    this.subscribeForRelatedData(productCategory);
  }

  subscribeForRelatedData(productCategory: number): void {
    this.item$
      .pipe(
        filter(claimant => !!claimant),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(() => {
        this.setHeaderBlocks(productCategory);
      });
  }

  setHeaderBlocks(productCategory: number): void {
    this.store.dispatch(actions.GetDataSource({ productCategory }));
    this.store.select(selectors.dataSource, productCategory)
      .pipe(
        filter(data => !!data),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(data => {
        this.lastLoadedDate = data.lastModifiedDate;
        this.headerBlocks = [
          { key: 'Name', value: data.name },
          { key: 'System', value: data.system },
          { key: 'Location', value: data.location },
        ];
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
