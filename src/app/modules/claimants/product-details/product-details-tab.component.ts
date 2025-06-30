import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { KeyValue } from '@app/models';
import * as rootSelectors from '@app/state';
import * as selectors from '../claimant-details/state/selectors';
import * as actions from '../claimant-details/state/actions';

import { ClaimantDetailsState } from '../claimant-details/state/reducer';

@Component({
  selector: 'app-product-details-tab',
  templateUrl: './product-details-tab.component.html',
  styleUrls: ['./product-details-tab.component.scss'],
})
export class ProductDetailsTabComponent implements OnInit, OnDestroy {
  public claimantId$ = this.store.select(selectors.id);
  public isProductDetailsLoaded$ = this.store.select(selectors.productDetailsIsLoaded);
  public claimantLoadingInProgress$ = this.store.select(rootSelectors.loadingInProgress);
  protected ngUnsubscribe$ = new Subject<void>();

  public claimantId: number;
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
    this.claimantId$
      .pipe(
        filter(claimantId => !!claimantId),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(claimantId => {
        this.claimantId = claimantId;
        this.store.dispatch(actions.GetProductDetails({ productCategory }));
      });

    this.store.select(selectors.productDetails, { typeId: productCategory })
      .pipe(
        filter(data => !!data),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(data => {
        this.headerBlocks = data.items;
        this.lastLoadedDate = data.lastModifiedDate;
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
