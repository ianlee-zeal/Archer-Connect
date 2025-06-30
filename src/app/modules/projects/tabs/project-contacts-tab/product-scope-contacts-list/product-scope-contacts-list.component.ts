import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';

import { AppState } from '@shared/state';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { ModalService } from '@app/services';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { DateFormatPipe } from '@app/modules/shared/_pipes/date-format.pipe';
import { GetProductScopeContactsList } from '@app/modules/projects/project-scope-of-work/state';
import { ProjectScopeStatusEnum } from '@app/models/enums';
import { ProjectContactsListActionPanelRendererComponent } from '../project-contacts-list-action-panel-renderer/project-contacts-list-action-panel-renderer.component';
import * as selectors from '../../../state/selectors';

@Component({
  selector: 'app-product-scope-contacts-list',
  templateUrl: './product-scope-contacts-list.component.html',
  styleUrls: ['./product-scope-contacts-list.component.scss'],
})
export class ProductScopeContactsListComponent extends ListView implements OnInit {
  public readonly gridId: GridId = GridId.ProductScopeContactsList;
  readonly actionBar$ = this.store.select(selectors.actionBar);

  @Input() projectId;

  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Product Category',
        field: 'productCategory.name',
        width: 60,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isAutofocused: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Engaged Status',
        field: 'status.name',
        colId: 'status.id',
        sortable: true,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter({ options: [
          {
            id: ProjectScopeStatusEnum.Yes,
            name: 'Yes',
          },
          {
            id: ProjectScopeStatusEnum.No,
            name: 'No',
          },
        ] }),
      },
      {
        headerName: 'First Name',
        field: 'assignedUser.firstName',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Last Name',
        field: 'assignedUser.lastName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Organization',
        field: 'assignedUser.org.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Email',
        field: 'assignedUser.email',
        sortable: true,
        ...AGGridHelper.emailColumnDefaultParams,
        minWidth: 160,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      buttonRenderer: ProjectContactsListActionPanelRendererComponent,
      activeRenderer: CheckboxEditorRendererComponent,
    },
  };

  constructor(
    public store: Store<AppState>,
    public route: ActivatedRoute,
    protected elementRef: ElementRef,
    protected router: Router,
    private datePipe: DateFormatPipe,
    public modalService: ModalService,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  protected fetchData(params): void {
    this.gridParams = params;
    this.store.dispatch(GetProductScopeContactsList({ projectId: this.projectId, agGridParams: params }));
  }
}
