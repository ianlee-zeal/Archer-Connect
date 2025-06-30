import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { Store } from '@ngrx/store';
import { authSelectors } from '@app/modules/auth/state';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserInfo } from '@app/models';
import { GridId } from '@app/models/enums/grid-id.enum';
import { Router } from '@angular/router';
import { GetUserRolesListRequest } from '../state/user-roles-list/actions';
import { userRolesListSelectors } from '../state/user-roles-list/selectors';
import { SharedUserRolesListState } from '../state/user-roles-list/reducer';
import { UserRolesListActionsRendererComponent } from './user-roles-list-actions-renderer/user-roles-list-actions-renderer.component';

@Component({
  selector: 'app-user-roles-list',
  templateUrl: './user-roles-list.component.html',
  styleUrls: ['./user-roles-list.component.scss'],
})
export class UserRolesListComponent implements OnInit {
  public readonly gridId: GridId = GridId.UserRoles;

  public user$ = this.store.select<any>(authSelectors.getUser);
  public data$ = this.store.select(userRolesListSelectors.userRolesList);

  private ngUnsubscribe$ = new Subject<void>();

  public readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Role',
        field: 'name',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Location',
        field: 'location',
        hide: true,
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      AGGridHelper.getActionsColumn({ viewPermissionsHandler: this.onViewPermissionsClicked.bind(this) }),
    ],
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    components: { buttonRenderer: UserRolesListActionsRendererComponent },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
  };

  constructor(
    private store: Store<SharedUserRolesListState>,
    private router: Router,
  ) { }

  ngOnInit() {
    this.user$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((user: UserInfo) => {
      this.store.dispatch(GetUserRolesListRequest({ userId: user.id }));
    });
  }

  protected onViewPermissionsClicked({ data }): void {
    const { accessPolicyId } = data;
    this.router.navigate(['/user-profile/permissions'], { queryParams: { accessPolicyId } });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
