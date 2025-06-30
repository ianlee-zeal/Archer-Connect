import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridId } from '@app/models/enums/grid-id.enum';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { AppState } from '@shared/state';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ModalService, PermissionService } from '@app/services';
import { ProjectCustomMessage } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';
import { OrganizationMessageModalComponent } from '../organization-message-modal/organization-message-modal.component';
import { ProjectMessagingPanelRendererComponent } from './project-messaging-panel-renderer/project-messaging-panel-renderer';

@Component({
  selector: 'app-project-messaging-list',
  templateUrl: './project-messaging-list.component.html',
  styleUrls: ['./project-messaging-list.component.scss'],
})
export class ProjectMessagingListComponent extends ListView implements OnInit, OnDestroy {
  @Input() projectId: number;
  public readonly gridId: GridId = GridId.ProjectMessagingList;

  readonly item$ = this.store.select(selectors.item);
  readonly projectFirmMessages$ = this.store.select(selectors.projectFirmMessages);
  public readonly actionBar: ActionHandlersMap = {
    back: null,
    new: {
      callback: () => this.openMessageModal(),
      permissions: PermissionService.create(PermissionTypeEnum.ProjectMessaging, PermissionActionTypeEnum.Create),
    },
  };

  public gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'Id',
        colId: 'id',
        field: 'id',
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Organization',
        field: 'primaryOrg.name',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Message',
        field: 'message',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy.displayName',
        sortable: true,
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
      },
      { ...AGGridHelper.getActionsColumn({ editHandler: this.openMessageModal.bind(this) }), pinned: null },
      {
        headerName: 'Active',
        field: 'active',
        sortable: true,
        suppressMenu: true,
        cellRenderer: 'activeRenderer',
        onCellClicked: ({ data }) => this.update(data),
        ...AGGridHelper.tagColumnDefaultParams,
      },
    ],
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    onRowDoubleClicked: event => this.openMessageModal(event.data, false),
    components: {
      activeRenderer: CheckboxEditorRendererComponent,
      buttonRenderer: ProjectMessagingPanelRendererComponent,
    },
    pagination: false,
  };

  constructor(
    private readonly store: Store<AppState>,
    private datePipe: DateFormatPipe,
    protected router: Router,
    protected elementRef: ElementRef,
    private modalService: ModalService,
    private permissionService: PermissionService,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.store.dispatch(actions.GetProjectFirmsMessaging({ projectId: this.projectId }));
  }

  // eslint-disable-next-line no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected fetchData(_params: IServerSideGetRowsParamsExtended): void { }

  public openMessageModal(data: ProjectCustomMessage = null, canEdit: boolean = true) {
    if (data && canEdit && !this.permissionService.canEdit(PermissionTypeEnum.ProjectMessaging)) {
      return;
    }
    this.modalService.show(
      OrganizationMessageModalComponent,
      { initialState: { canEdit, projectId: this.projectId, ...data }, class: 'organization-message-modal' },
    );
  }

  public update(projectCustomMessage: ProjectCustomMessage) {
    const message = ProjectCustomMessage.toDto({
      ...projectCustomMessage,
      active: !projectCustomMessage.active,
    });
    this.store.dispatch(actions.EditProjectOrganizationMessage({ id: projectCustomMessage.id, message }));
  }

  public ngOnDestroy(): void {
  }
}
