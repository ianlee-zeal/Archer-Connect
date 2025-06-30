import { Component, OnInit, OnDestroy } from '@angular/core';
import { GridApi, RowNode, GridOptions } from 'ag-grid-community';
import { Store, ActionsSubject } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PermissionService } from '@app/services';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { checkboxColumn } from '@app/modules/shared/_grid-columns/columns';
import { PrimaryTagRendererComponent } from '@app/modules/shared/_renderers/primary-tag-renderer/primary-tag-renderer.component';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { UntypedFormGroup } from '@angular/forms';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { ofType } from '@ngrx/effects';
import * as rootActions from '@app/state/root.actions';
import * as orgActions from '../state/actions';
import { orgTypesSelectors } from '../state/selectors';
import * as fromOrg from '../state';
import { OrganizationTabHelper } from '../organization-tab.helper';

@Component({
  selector: 'app-org-types-list',
  templateUrl: './org-types-list.component.html',
  styleUrls: ['./org-types-list.component.scss'],
})
export class OrgTypesListComponent extends Editable implements OnInit, OnDestroy {
  public readonly gridId: GridId = GridId.OrgTypes;

  public readonly gridOptions: GridOptions = {
    rowMultiSelectWithClick: true,
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    columnDefs: [
      checkboxColumn,
      {
        headerName: 'Primary',
        field: 'isPrimary',
        cellRenderer: 'primaryRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
      },
      {
        headerName: 'Type Name',
        field: 'name',
        minWidth: 200,
        resizable: true,
      },
      {
        headerName: 'Last Modified By',
        field: 'lastModifiedBy.displayName',
        width: 200,
        resizable: true,
        minWidth: 150,
      },
      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        suppressSizeToFit: true,
        resizable: true,
        width: 180,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
      },
    ],
    components: { primaryRenderer: PrimaryTagRendererComponent },
    onSelectionChanged: () => {
      const ids = this.gridApi.getSelectedRows().map(item => item.id);
      this.store.dispatch(orgActions.ChangeSelectedOrgTypes({ selectedIds: ids }));
    },
  };

  public isDirty$ = this.store.select(orgTypesSelectors.isDirty);
  public initiallySelected$ = this.store.select(orgTypesSelectors.initiallySelected);
  public selected$ = this.store.select(orgTypesSelectors.selected);
  public actionBar$ = this.store.select(fromOrg.actionBar);

  private gridApi: GridApi;
  private isDirty: boolean;
  private ngUnsubscribe$ = new Subject<void>();
  private initiallySelected: number[];
  private selected: number[];

  get hasChanges(): boolean {
    return this.isDirty;
  }

  protected get validationForm(): UntypedFormGroup {
    return null;
  }

  constructor(
    private readonly store: Store<fromOrg.AppState>,
    private readonly datePipe: DateFormatPipe,
    private readonly actionsSubj: ActionsSubject,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.store.dispatch(orgActions.ResetOrgTypesTab());

    this.isDirty$.pipe(
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe((isDirty: boolean) => {
        this.isDirty = isDirty;
      });

    this.initiallySelected$.pipe(
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe((initiallySelected: number[]) => {
        this.initiallySelected = initiallySelected;
      });

    this.selected$.pipe(
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe((selected: number[]) => {
        this.selected = selected;
      });

    this.actionsSubj.pipe(
      ofType(orgActions.GetOrgTypesAssignmentsComplete),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.selectRows(action.typeIds);
    });

    this.store.dispatch(orgActions.UpdateOrgsActionBar({
      actionBar: {
        save: {
          callback: () => this.save(),
          permissions: PermissionService.create(PermissionTypeEnum.OrganizationTypes, PermissionActionTypeEnum.Edit),
          disabled: () => !this.isDirty,
          awaitedActionTypes: [
            orgActions.SaveOrgTypeAssignmentsComplete.type,
            orgActions.SaveOrgTypeAssignmentsError.type,
          ],
        },
        cancel: {
          callback: () => this.cancel(this.initiallySelected),
          disabled: () => !this.isDirty,
        },
        back: () => OrganizationTabHelper.handleBackClick(this.store),
      },
    }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(rootActions.GridRowToggleCheckbox({ gridId: this.gridId, selectedRecordsIds: new Map() }));

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
  }

  public loadData(agGridParams): void {
    this.store.dispatch(orgActions.GetOrgTypesGrid({ agGridParams }));
  }

  protected save(): void {
    this.store.dispatch(orgActions.SaveOrgTypeAssignments());
  }

  private selectRows(ids: number[]): void {
    this.store.dispatch(orgActions.ChangeSelectedOrgTypes({ selectedIds: ids }));

    const rowNodes:RowNode[] = [];
    this.gridApi.forEachNode((rowNode: RowNode) => {
      if (rowNode.data && rowNode.data.id && ids.includes(rowNode.data.id)) {
        rowNodes.push(rowNode);
      }
    });
    this.gridApi.setNodesSelected({ nodes: rowNodes, newValue: true });
  }

  private cancel(initiallySelectedIds: number[]): void {
    this.gridApi.deselectAll();
    this.selectRows(initiallySelectedIds);
  }
}
