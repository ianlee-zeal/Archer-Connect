import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GridApi } from 'ag-grid-community';
import * as rootSelectors from '@app/state/index';
import * as rootActions from '@app/state/root.actions';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CommonHelper } from '@app/helpers';
import { AppState } from '../../../../state';

@Component({
  selector: 'app-grid-header-checkbox',
  templateUrl: './grid-header-checkbox.component.html',
  styleUrls: ['./grid-header-checkbox.component.scss'],
})
export class GridHeaderCheckboxComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe$ = new Subject<void>();

  public params: any;
  public selectAll: boolean = false;
  public gridId: GridId;
  public floatingFilter = true;
  public pinned = false;

  constructor(
    private readonly store: Store<AppState>,
  ) { }

  ngOnInit(): void {
    this.store.select(rootSelectors.isAllRowSelectedByGridId({ gridId: this.gridId }))
      .pipe(
        filter(x => !CommonHelper.isNullOrUndefined(x)),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((isAllRowSelected: boolean) => {
        this.selectAll = isAllRowSelected;
      });
  }

  agInit(params): void {
    this.params = params;
    this.gridId = params?.gridId;
    this.pinned = params?.pinned;
    if (!CommonHelper.isNullOrUndefined(params?.floatingFilter)) {
      this.floatingFilter = params?.floatingFilter;
    }
  }

  onClick(event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const api = this.params.api as GridApi;
    api.forEachNode(node => {
      node.setSelected(isChecked, false);
    });

    this.store.dispatch(rootActions.SetAllRowSelected({ gridId: this.gridId, isAllRowSelected: isChecked }));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
