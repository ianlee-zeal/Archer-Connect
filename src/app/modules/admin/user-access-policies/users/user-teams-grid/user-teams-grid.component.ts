import { ModalService, PermissionService } from '@app/services';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { Store } from '@ngrx/store';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { first } from 'rxjs/operators';
import { TeamToUser } from '@app/models';
import { GetUserTeams } from '../state/actions';
import * as selectors from '../state/selectors';
import { UsersState } from '../state/state';
import { CreateOrEditUserTeamDialogComponent } from './dialogs/create-or-edit-user-team-dialog/create-or-edit-user-team-dialog.component';
import { UserTeamsGridActionsRendererComponent } from './renderers/user-teams-grid-actions-renderer/user-teams-grid-actions-renderer.component';
import { PermissionTypeEnum, PermissionActionTypeEnum } from '@app/models/enums';

@Component({
  selector: 'app-user-teams-grid',
  templateUrl: './user-teams-grid.component.html',
  styleUrls: ['./user-teams-grid.component.scss'],
})
export class UserTeamsGridComponent implements OnChanges {
  @Input() userId: number;

  readonly gridId: GridId = GridId.UserTeams;
  readonly user$ = this.store.select(selectors.currentUser);
  readonly userTeams$ = this.store.select(selectors.currentUserTeams);

  actionBar: ActionHandlersMap = {
    back: null,
    new: {
      callback: () => (this.createOrUpdateUserTeam()),
      permissions: [PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Edit),
        PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Teams)],
    },
  };

  readonly gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'Team',
        field: 'team.name',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Role',
        field: 'isManager',
        sortable: true,
        valueFormatter: (data: ValueFormatterParams) => (data.value ? 'Manager' : 'Team Member'),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Active',
        field: 'isActive',
        sortable: true,
        cellRenderer: 'checkBoxRenderer',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy.userName',
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
      this.permissionService.canEdit(PermissionTypeEnum.Users) ? AGGridHelper.getActionsColumn({ editHandler: this.onEdit.bind(this) }, 70) : {},
    ],
    components: {
      checkBoxRenderer: CheckboxEditorRendererComponent,
      buttonRenderer: UserTeamsGridActionsRendererComponent,
    },
    rowSelection: 'single',
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
  };

  constructor(
    private readonly store: Store<UsersState>,
    private readonly datePipe: DateFormatPipe,
    private readonly modalService: ModalService,
    private readonly permissionService: PermissionService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.userId && this.userId) {
      this.loadData();
    }
  }

  createOrUpdateUserTeam(team?: TeamToUser) {
    this.userTeams$.pipe(
      first(),
    ).subscribe(userTeams => {
      const usedTeams: Set<number> = new Set();
      if (userTeams) {
        userTeams.forEach(ut => {
          if (!team || team.teamId !== ut.teamId) {
            usedTeams.add(ut.teamId);
          }
        });
      }

      this.modalService.show(CreateOrEditUserTeamDialogComponent, {
        initialState: {
          usedTeams,
          team: team || { userId: this.userId, isManager: false },
          onSaveFinished: (() => this.loadData()),
        },
      });
    });
  }

  private onEdit(data: TeamToUser) {
    this.createOrUpdateUserTeam(data);
  }

  private loadData() {
    this.store.dispatch(GetUserTeams({ userId: this.userId }));
  }
}
