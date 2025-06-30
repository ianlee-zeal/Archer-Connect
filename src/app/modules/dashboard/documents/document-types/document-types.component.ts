import { Store } from '@ngrx/store';
import { Component, ElementRef, OnInit } from '@angular/core';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { Router } from '@angular/router';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { ModalService, PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { AddNewDocumentTypeModalComponent } from '../add-new-document-type-modal/add-new-document-type-modal.component';
import * as actions from '../state/actions';
import { DocumentTypesState } from '../state/reducer';
import { DocTypesButtonsRendererComponent } from '../renderers/doc-types-buttons-renderer';

@Component({
  selector: 'app-document-types',
  templateUrl: './document-types.component.html',
  styleUrls: ['./document-types.component.scss'],
})
export class DocumentTypesComponent extends ListView implements OnInit {
  public readonly gridId: GridId = GridId.DocumentTypes;

  public readonly gridOptions: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 70,
        maxWidth: 70,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Description',
        field: 'description',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Entity Type',
        field: 'entityType.name',
        sortable: true,
        width: 150,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Product Category',
        field: 'productCategory.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.addressColumnDefaultParams,
      },
      {
        headerName: 'Status',
        field: 'isActive',
        cellRenderer: data => (data.value ? 'Active' : 'Inactive'),
        sortable: true,
        ...AGGridHelper.getActiveInactiveFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        ...AGGridHelper.cityColumnDefaultParams,
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.dateColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'System Deployed?',
        field: 'isSystem',
        sortable: true,
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
        width: 150,
        minWidth: 150,
      },
      AGGridHelper.getActionsColumn({ editDocTypeHandler: this.edit.bind(this) }),
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: { activeRenderer: CheckboxEditorRendererComponent, buttonRenderer: DocTypesButtonsRendererComponent },
    onRowDoubleClicked: this.edit.bind(this),
  };

  constructor(
    private store: Store<DocumentTypesState>,
    public modalService: ModalService,
    private datePipe: DateFormatPipe,
    protected router: Router,
    protected elementRef: ElementRef,
    private permissionService: PermissionService,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
  }

  protected fetchData(agGridParams): void {
    this.store.dispatch(actions.GetDocumentTypesList({ agGridParams }));
  }

  public actionBar: ActionHandlersMap = {
    new: {
      callback: () => this.addNew(),
      permissions: [
        PermissionService.create(PermissionTypeEnum.DocumentType, PermissionActionTypeEnum.Create),
      ],
    },
    clearFilter: this.clearFilterAction(),
  };
  protected onRowDoubleClicked(data): void {
    this.edit(data);
  }

  public addNewRecord(): void {
    this.addNew();
  }

  private addNew(): void {
    this.modalService.show(AddNewDocumentTypeModalComponent, {
      class: 'add-document-type-modal',
      initialState: { title: 'Add New Document Type' },
    });
  }

  public edit(e): void {
    const canEdit = this.permissionService.canEdit(PermissionTypeEnum.DocumentType);

    if (!canEdit) {
      return;
    }

    this.modalService.show(AddNewDocumentTypeModalComponent, {
      class: 'add-document-type-modal',
      initialState: { title: 'Edit Document Type', documentTypeId: e.data.id },
    });
  }
}
