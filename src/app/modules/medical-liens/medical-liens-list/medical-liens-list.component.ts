import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { MedicalLiensOverviewItem } from '@app/models/medical-liens-overview-item';
import * as fromAuth from '@app/modules/auth/state';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { environment } from 'src/environments/environment';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as rootSelectors from '@app/state';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { CurrencyHelper, StringHelper } from '@app/helpers';
import * as fromShared from '../../shared/state';
import { MedicalLiensActionPanelRendererComponent } from '../renderers/action-panel-renderer/medical-liens-action-panel-renderer';
import * as actions from './state/actions';
import * as selectors from './state/selectors';
import { ValueWithTooltipRendererComponent } from '@app/modules/shared/_renderers/value-with-tooltip-renderer/value-with-tooltip-renderer.component';
import { LienStageRendererComponent } from '@app/modules/shared/_renderers/lien-stage-renderer/lien-stage-renderer.component';
import { PermissionService } from '@app/services';
import { PermissionTypeEnum, PermissionActionTypeEnum } from '@app/models/enums';

const { sharedActions } = fromShared;

@Component({
  selector: 'app-medical-liens-list',
  templateUrl: './medical-liens-list.component.html',
  styleUrls: ['./medical-liens-list.component.scss'],
})
export class MedicalLiensListComponent extends ListView implements OnInit, OnDestroy {
  @Input() public claimantId: number;

  public readonly gridId: GridId = GridId.MedicalLiens;

  public readonly medicalLiensOverviewItems$ = this.store.select(selectors.medicalLiensListSelectors.medicalLiensList);

  public agGridParams$ = this.store.select(selectors.medicalLiensListSelectors.agGridParams);

  public authStore$ = this.store.select(fromAuth.authSelectors.getUser);

  private readonly canViewLienPaidDatePermission = this.permissionService.has(PermissionService.create(PermissionTypeEnum.LienProducts, PermissionActionTypeEnum.ViewLienPaidDate));

  private gOptions;

  private timezone: string;
  public loadingInProgress$ = this.store.select(rootSelectors.loadingInProgress);
  protected ngUnsubscribe$ = new Subject<void>();

  public get gridOptions() {
    if (this.gOptions) { return this.gOptions; }

    this.gOptions = {
      ...AGGridHelper.defaultGridOptions,
      columnDefs: [
        {
          headerName: 'Lien Product ID',
          field: 'lienProductId',
          colId: 'id',
          maxWidth: 110,
          sortable: true,
          ...AGGridHelper.nameColumnDefaultParams,
        },
        {
          headerName: 'Lien Category',
          field: 'lienProductCategory',
          sortable: true,
          ...AGGridHelper.nameColumnDefaultParams,
        },
        {
          headerName: 'Lien Type',
          field: 'lienType',
          sortable: true,
          ...AGGridHelper.nameColumnDefaultParams,
        },
        {
          headerName: 'On Benefits',
          field: 'onBenefits',
          width: 110,
          maxWidth: 110,
          cellRenderer: 'checkboxRenderer',
          sortable: true,
        },
        {
          headerName: 'Lienholder',
          field: 'lienHolder',
          resizable: true,
          sortable: true,
          width: 110,
          suppressSizeToFit: true,
          cellRenderer: 'valueWithTooltip',
        },
        {
          headerName: 'Collector',
          field: 'collector',
          sortable: true,
          ...AGGridHelper.nameColumnDefaultParams,
        },
        {
          headerName: 'Inbound Lien Amount',
          headerTooltip: 'Inbound Lien Amount',
          field: 'inboundLienAmount',
          cellRenderer: data => (StringHelper.isNumericString(data.value)
            ? CurrencyHelper.toUsdFormat(data)
            : data.value),
          sortable: true,
          suppressSizeToFit: true,
          ...AGGridHelper.amountColumnDefaultParams,
        },
        {
          headerName: 'Current Lien Amount',
          headerTooltip: 'Current Lien Amount',
          field: 'currentLienAmount',
          cellRenderer: data => (StringHelper.isNumericString(data.value)
            ? CurrencyHelper.toUsdFormat(data)
            : data.value),
          sortable: true,
          suppressSizeToFit: true,
          ...AGGridHelper.amountColumnDefaultParams,
        },
        {
          headerName: 'Final Lien Amount',
          field: 'finalLienAmount',
          cellRenderer: data => (StringHelper.isNumericString(data.value)
            ? CurrencyHelper.toUsdFormat(data)
            : data.value),
          sortable: true,
          suppressSizeToFit: true,
          ...AGGridHelper.amountColumnDefaultParams,
        },
        {
          headerName: 'Phase',
          field: 'phase',
          width: 100,
          sortable: true,
          resizable: true,
        },
        {
          headerName: 'Stage',
          field: 'stage',
          width: 100,
          sortable: true,
          resizable: true,
          cellRenderer: 'lienStageRenderer',
        },
        {
          headerName: 'Lien Paid Date',
          field: 'lienPaidDate',
          sortable: true,
          cellRenderer: data => this.datePipe.transform(data.value, true, null, this.timezone, true),
          ...AGGridHelper.dateTimeColumnDefaultParams,
          hide: !this.canViewLienPaidDatePermission,
        },
        AGGridHelper.getActionsColumn({ onEditHandler: this.onOpenInLPMHandler.bind(this) }, 80),
      ],
      components: {
        buttonRenderer: MedicalLiensActionPanelRendererComponent,
        checkboxRenderer: CheckboxEditorRendererComponent,
        valueWithTooltip: ValueWithTooltipRendererComponent,
        lienStageRenderer: LienStageRendererComponent,
      },
    } as GridOptions;

    return this.gOptions;
  }
  constructor(
    private store: Store<fromShared.AppState>,
    private datePipe: DateFormatPipe,
    protected router: Router,
    protected elementRef : ElementRef,
    private readonly permissionService: PermissionService,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.agGridParams$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(
      value => { this.gridParams = value; },
    );

    this.authStore$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.timezone = user.timezone && user.timezone.name;
    });
  }

  private onOpenInLPMHandler(data: MedicalLiensOverviewItem): void {
    const endpoint = environment.lpm_url;
    const url = `${endpoint}/#product-details?lienId=${data.lienProductId}`;
    window.open(url, '_blank');
  }

  protected fetchData(agGridParams): void {
    this.gridParams = agGridParams;
    this.store.dispatch(actions.GetMedicalLiensList({ claimantId: this.claimantId, agGridParams }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(sharedActions.addressesListActions.UpdateAddressesListActionBar({ actionBar: null }));

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
