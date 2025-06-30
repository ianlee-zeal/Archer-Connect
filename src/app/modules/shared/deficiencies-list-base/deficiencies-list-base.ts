import { ElementRef, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { Deficiency } from '@app/models/deficiency';
import { SearchTypeEnum } from '@app/models/enums';
import { DeficiencyStatus, DeficiencyStatusFilterValues } from '@app/models/enums/deficiency-status.enum';
import { MessageService, ModalService } from '@app/services';
import { AgPromise, GridApi, IFilter } from 'ag-grid-community';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ListView } from '../_abstractions/list-view';
import { DateFormatPipe } from '../_pipes';

@Directive()
export abstract class DeficienciesListBase extends ListView {
  // required for deficienecy curing - gd
  public caseId: number;

  constructor(
    protected readonly router: Router,
    protected messageService: MessageService,
    public readonly modalService: ModalService,
    protected readonly elementRef: ElementRef,
    protected readonly datePipe: DateFormatPipe,
  ) {
    super(router, elementRef);
  }

  protected readonly STATUS_COL_ID = 'isCured';

  protected abstract onFetchData(params: IServerSideGetRowsParamsExtended): void;
  protected abstract overrideDeficiency(id: number, caseId: number): void;

  public gridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);
    this.setDefaultFilter();
  }

  protected onOverride(data: Deficiency) {
    const { id } = data;
    const caseId = this.caseId;
    this.messageService.showConfirmationDialog(
      'Confirm Deficiency Override',
      'Are you sure you want cure this deficiency?',
    )
      .subscribe(answer => {
        if (answer) {
          this.overrideDeficiency(id, caseId);
        }
      });
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
    this.onFetchData(params);
  }

  private async setDefaultFilter() {
    this.gridApi.getColumnFilterInstance(this.STATUS_COL_ID).then((filterComponent: IFilter) => {
      const promise = filterComponent.setModel({
        type: SearchTypeEnum.Equals,
        filter: DeficiencyStatusFilterValues[DeficiencyStatus.Active],
      }) as AgPromise<void>;
      if (promise) {
        promise.then(() => { this.gridApi.onFilterChanged(); });
      }
    });
  }

  private getEntityLink(data): string {
    switch (data.entityTypeName) {
      case 'Claimants':
        return `claimants/${data.clientId}`;
      case 'Claim Settlement Ledgers':
        return `claimants/${data.clientId}/payments/tabs/ledger-summary/${data.entityId}`;
      case 'Claim Settlement Ledger Entries':
        return `claimants/${data.clientId}/payments/tabs/ledger-summary/${data.ledgerId}`;
      default:
        return '';
    }
  }

  protected onShowEntityLink({ data }): boolean {
    const entityTypeNames = ['Claimants', 'Claim Settlement Ledgers', 'Claim Settlement Ledger Entries'];
    return entityTypeNames.indexOf(data.entityTypeName) > -1;
  }

  protected goToEntityDetails({ data }): void {
    const path = this.getEntityLink(data);
    this.router.navigate([`${path}`]);
  }

  protected onShowClientLink(): boolean {
    return true;
  }

  protected goToClientDetails({ data }): void {
    this.router.navigate([`/claimants/${data.clientId}`]);
  }
}
