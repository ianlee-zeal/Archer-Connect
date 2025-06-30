import { CurrencyPipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state';
import { Subject } from 'rxjs';
import { ExpansionBarElement } from '@app/models';
import { filter, takeUntil } from 'rxjs/operators';

import { GridId } from '@app/models/enums/grid-id.enum';
import { LedgerVariance } from '@app/models/closing-statement/ledger-variance';
import { LedgerVarianceGroupEntry } from '@app/models/closing-statement/ledger-variance-group-entry';
import * as selectors from '../../../state/selectors';
import * as actions from '../../../state/actions';

@Component({
  selector: 'app-variances-list',
  templateUrl: './variances-list.component.html',
  styleUrls: ['./variances-list.component.scss'],
})
export class VariancesListComponent implements OnInit, OnDestroy {
  readonly gridId = GridId.LedgerVariances;
  readonly variances$ = this.store.select(selectors.ledgerVariances);
  protected ngUnsubscribe$ = new Subject<void>();
  private variances: LedgerVariance[];

  @Input() public claimantId: number;
  @Input() public disbursementGroupId: number;

  public isExpandedAll: boolean = false;
  private expandedGroups = new Set<number>();

  constructor(
    private readonly store: Store<AppState>,
    private readonly currencyPipe: CurrencyPipe,
  ) {
  }

  ngOnInit(): void {
    this.store.dispatch(actions.GetLedgerVariances({ clientId: this.claimantId, disbursementGroupId: this.disbursementGroupId }));
    this.variances$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(x => !!x),
    ).subscribe(items => {
      this.variances = items;
    });
  }

  public getExpandedState(id: number) {
    return this.expandedGroups.has(id);
  }

  public onGroupExpanded(id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.expandedGroups.has(id)
      ? this.expandedGroups.delete(id)
      : this.expandedGroups.add(id);
  }

  public getHeaderElements(): ExpansionBarElement[] {
    return [
      {
        valueGetter: () => 'Account #',
        width: '123px',
      },
      {
        valueGetter: () => 'Description',
        width: '300px',
      },
      {
        valueGetter: () => 'Current Amount',
        width: '160px',
        isRightAligned: true,
      },
      {
        valueGetter: () => 'Imported Amount',
        width: '160px',
        isRightAligned: true,
      },
      {
        valueGetter: () => 'Difference',
        width: '110px',
        isRightAligned: true,
      },
      {
        valueGetter: () => 'Ledger Version',
        width: '130px',
      },
    ];
  }

  public downloadFile() {

  }

  public getGroupElements(variance: LedgerVariance): ExpansionBarElement[] {
    return [
      {
        valueGetter: () => variance.accountGroupNo,
        width: '123px',
      },
      {
        valueGetter: () => variance.description,
        width: '300px',
      },
      {
        valueGetter: () => this.currencyPipe.transform(variance.previousValue),
        width: '160px',
        isRightAligned: true,
      },
      {
        valueGetter: () => this.currencyPipe.transform(variance.newValue),
        width: '160px',
        isRightAligned: true,
      },
      {
        valueGetter: () => this.currencyPipe.transform(variance.amount),
        width: '110px',
        isRightAligned: true,
      }
    ];
  }

  public getSubGroupElements(groupEntry: LedgerVarianceGroupEntry): ExpansionBarElement[] {
    return [
      {
        valueGetter: () => groupEntry.accountNo,
        width: '103px',
      },
      {
        valueGetter: () => `${groupEntry.name}`,
        width: '300px',
      },
      {
        valueGetter: () => this.currencyPipe.transform(groupEntry.previousValue),
        width: '160px',
        isRightAligned: true,
      },
      {
        valueGetter: () => this.currencyPipe.transform(groupEntry.newValue),
        width: '160px',
        isRightAligned: true,
      },
      {
        valueGetter: () => this.currencyPipe.transform(groupEntry.amount),
        width: '110px',
        isRightAligned: true,
      },
      {
        valueGetter: () => '',
        width: '130px',
      },
      {
        valueGetter: () => groupEntry.ledgerVersion,
        width: '130px',
      },
    ];
  }

  public toggleExpandAll() {
    this.isExpandedAll = !this.isExpandedAll;
    this.expandedGroups.clear();
    this.variances.forEach(item => {
      if (this.isExpandedAll) {
        this.expandedGroups.add(item.id);
      } else {
        this.expandedGroups.delete(item.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.ClearLedgerVariances());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
