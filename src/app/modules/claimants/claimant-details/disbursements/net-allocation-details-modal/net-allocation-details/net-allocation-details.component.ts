import { CurrencyPipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

import { CommonHelper } from '@app/helpers/common.helper';
import { ExpansionBarElement } from '@app/models';
import {
  NetAllocationDetails,
  NetAllocationFormula,
  NetAllocationVariable,
} from '@app/models/closing-statement';
import { NetAllocationDetailsEnum } from '@app/models/enums';

@Component({
  selector: 'app-net-allocation-details',
  templateUrl: './net-allocation-details.component.html',
  styleUrls: ['./net-allocation-details.component.scss'],
})
export class NetAllocationDetailsComponent implements OnChanges, OnInit {
  @Input()
  netAllocationDetails: NetAllocationDetails;

  public netAllocation: string;
  public isExpandedAll: boolean = false;
  private expandedGroups = new Set<number>();

  constructor(public currencyPipe: CurrencyPipe) {}

  ngOnInit(): void {
    if (this.netAllocationDetails) {
      this.netAllocation = this.currencyPipe.transform(
        this.netAllocationDetails.netAllocation,
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { netAllocationDetails } = this;
    const stateChanges = changes[CommonHelper.nameOf({ netAllocationDetails })];

    if (netAllocationDetails && stateChanges) {
      this.netAllocation = this.currencyPipe.transform(
        netAllocationDetails.netAllocation,
      );
    }
  }

  public getExpandedState(step: number) {
    return this.expandedGroups.has(step);
  }

  public getGroupElements(formula: NetAllocationFormula): ExpansionBarElement[] {
    return [
      {
        valueGetter: () => formula.step,
        width: '50px',
      },
      {
        valueGetter: () => formula.formula,
        width: '462px',
      },
      {
        valueGetter: () => formula.operation,
        width: '320px',
        tooltip: formula.operation.length < formula.operationDescription.length ? formula.operationDescription : null,
      },
      {
        valueGetter: () => this.currencyPipe.transform(formula.result),
        width: '52px',
      },
    ];
  }

  public getHeaderElements(): ExpansionBarElement[] {
    return [
      {
        valueGetter: () => NetAllocationDetailsEnum.Step,
        width: '58px',
      },
      {
        valueGetter: () => NetAllocationDetailsEnum.Formula,
        width: '462px',
      },
      {
        valueGetter: () => NetAllocationDetailsEnum.Operation,
        width: '320px',
      },
      {
        valueGetter: () => NetAllocationDetailsEnum.Result,
        width: '52px',
      },
    ];
  }

  public getSubHeaderElements(): ExpansionBarElement[] {
    return [
      {
        valueGetter: () => NetAllocationDetailsEnum.Empty,
        width: '58px',
      },
      {
        valueGetter: () => NetAllocationDetailsEnum.Variable,
        width: '462px',
      },
      {
        valueGetter: () => NetAllocationDetailsEnum.Empty,
        width: '320px',
      },
      {
        valueGetter: () => NetAllocationDetailsEnum.Value,
        width: '52px',
      },
    ];
  }

  public getSubGroupElements(variable: NetAllocationVariable): ExpansionBarElement[] {
    return [
      {
        valueGetter: () => NetAllocationDetailsEnum.Empty,
        width: '58px',
      },
      {
        valueGetter: () => variable.variable,
        width: '462px',
      },
      {
        valueGetter: () => NetAllocationDetailsEnum.Empty,
        width: '320px',
      },
      {
        valueGetter: () => (isNaN(variable.value) ? variable.value : this.currencyPipe.transform(variable.value)),
        width: '52px',
      },
    ];
  }

  public onGroupExpanded(step: number) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.expandedGroups.has(step)
      ? this.expandedGroups.delete(step)
      : this.expandedGroups.add(step);
  }

  public toggleExpandAll() {
    this.isExpandedAll = !this.isExpandedAll;
    this.expandedGroups.clear();
    this.netAllocationDetails.formulas.forEach(item => {
      if (this.isExpandedAll) {
        this.expandedGroups.add(item.step);
      } else {
        this.expandedGroups.delete(item.step);
      }
    });
  }
}
