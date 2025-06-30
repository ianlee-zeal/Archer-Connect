import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AGGridHelper, IconHelper, SearchOptionsHelper } from '@app/helpers';
import { Claimant } from '@app/models/claimant';
import { DeficienciesButtonsRendererComponent } from '@app/modules/shared/deficiencies-list-base/deficiencies-buttons-renderer/deficiencies-buttons-renderer.component';
import { TextWithIconRendererComponent } from '@app/modules/shared/_renderers/text-with-icon-renderer/text-with-icon-renderer.component';
import { LinkActionRendererComponent } from '@app/modules/shared/_renderers/link-action-renderer/link-action-renderer.component';
import { CellRendererSelectorResult, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridId } from '@app/models/enums/grid-id.enum';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AppState } from '@app/modules/projects/state';
import { Store } from '@ngrx/store';
import { filter, first, takeUntil } from 'rxjs/operators';
import * as claimantActions from '@app/modules/claimants/claimant-details/state/actions';
import * as fromClaimant from '@app/modules/claimants/claimant-details/state/selectors';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { ModalService, MessageService, PermissionService } from '@app/services';
import { ResolveDeficienciesModalComponent } from './resolve-deficiency-modal/resolve-deficiency-modal.component';
import { ClaimantDeficiency } from '@app/models/claimant-deficiency';
import { PermissionTypeEnum } from '@app/models/enums';

interface IResolveDeficienciesModalParams {
  title?: string;
  deficiencies: ClaimantDeficiency[];
  isMultipleDeficiencies?: boolean;
}

@Component({
  selector: 'app-claimant-dashboard-deficiencies',
  templateUrl: './claimant-dashboard-deficiencies.component.html',
  styleUrls: ['../claimant-dashboard.component.scss', './claimant-dashboard-deficiencies.component.scss'],
})
export class ClaimantDashboardDeficienciesComponent extends ListView {
  public gridId: GridId = GridId.ClaimantPortalDeficiencies;
  public claimant$ = this.store.select(fromClaimant.item);
  public readonly uncuredDeficienciesCount$ = this.store.select(fromClaimant.uncuredDeficienciesCount);
  public readonly claimantDeficiencies$ = this.store.select(fromClaimant.claimantDeficiencies);

  public claimantId: number;
  public projectId: number;
  public title: string;
  public subTitle: string;

  public hasClaimantDeficienciesEditPermission = this.permissionService.canEdit(PermissionTypeEnum.ClaimantDeficiencies);

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Deficiency Category',
        field: 'deficiencyCategoryName',
        sortable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Deficiency Type',
        field: 'deficiencyTypeDisplayName',
        sortable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Stage',
        field: 'stage',
        cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult => (
          AGGridHelper.getTextBoxWithIconRenderer({
            text: params.data?.stage || '',
            icon: IconHelper.getDeficiencyStageIcon(params.data?.stageId),
          })
        ),
        minWidth: 140,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Notes',
        field: 'notes',
        sortable: true,
        resizable: true,
        width: 200,
        minWidth: 200,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowClicked: this.onRowClicked.bind(this),
    rowClass: this.hasClaimantDeficienciesEditPermission ? 'cursor-pointer' : '',
    components: {
      buttonRenderer: DeficienciesButtonsRendererComponent,
      textWithIconRenderer: TextWithIconRendererComponent,
      linkActionRenderer: LinkActionRendererComponent,
    },
  };

  constructor(
    protected readonly router: Router,
    protected readonly store: Store<AppState>,
    public readonly modalService: ModalService,
    protected readonly elementRef: ElementRef,
    private readonly messageService: MessageService,
    private readonly permissionService: PermissionService
  ) {
    super(router, elementRef);
  }

  public ngOnInit() {
    this.claimant$
      .pipe(
        filter((item: Claimant) => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((claimant: Claimant) => {
        this.claimantId = claimant.id;
        this.title = claimant.fullName;
        this.projectId = claimant.project.id;
        this.subTitle = claimant.project && claimant.project.name;

        if (this.gridParams) {
          this.fetchData(this.gridParams);
        }
      });
  }

  goToProject() {
    this.router.navigate(['/projects', this.projectId]);
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended) {
    if (this.claimantId) {
      var filters = [
        SearchOptionsHelper.getNumberFilter('clientId', FilterTypes.Number, 'equals', this.claimantId),
      ];

      params.request.filterModel = params.request.filterModel.concat(filters);

      this.store.dispatch(claimantActions.GetClaimantDeficienciesList({ params }));
    }

    this.gridParams = params;
  }

  protected onRowClicked({data: row}) {
    if (!this.hasClaimantDeficienciesEditPermission) {
      return;
    }

    if(!row){
      return;
    }

    const deficiencyItem = new ClaimantDeficiency(row);
    if(deficiencyItem.expectedResponseId){
      this.openResolveDeficienciesModal({ deficiencies: [deficiencyItem] });
    }
  }

  protected onClickResolveDeficiencies() {
    this.claimantDeficiencies$
      .pipe(
        filter((deficienciesList: ClaimantDeficiency[]) => !!deficienciesList && deficienciesList.length > 0),
        first(),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(deficienciesList => {
        this.openResolveDeficienciesModal({
          title: "Resolve Deficiencies",
          deficiencies: deficienciesList,
          isMultipleDeficiencies: true,
        });
      });
  }

  private openResolveDeficienciesModal(params: IResolveDeficienciesModalParams) {
    this.modalService.show(ResolveDeficienciesModalComponent, {
       class: 'modal-lg',
       initialState: {
          clientId: this.claimantId,
          onSubmitFinished: this.onSubmitFinished.bind(this),
          ...params,
       }
      });
  }

  public onSubmitFinished() {
    this.messageService.showInfoDialog('Thank you for your help!', 'Your responses have been <strong>received</strong> and will be <strong>reviewed</strong> by our team.');
    this.fetchData(this.gridParams);
    this.store.dispatch(claimantActions.GetPortalDeficienciesCount({ clientId: this.claimantId }))
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
