import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';

import { AppState } from '@shared/state';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { ModalService } from '@app/services';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { DateFormatPipe } from '@app/modules/shared/_pipes/date-format.pipe';
import { first } from 'rxjs/operators';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ProjectContactsListActionPanelRendererComponent } from '../project-contacts-list-action-panel-renderer/project-contacts-list-action-panel-renderer.component';
import { EditContactModalComponent } from '../edit-contact-modal/edit-contact-modal.component';
import { ViewContactModalComponent } from '../view-contact-modal/view-contact-modal.component';
import * as actions from '../../../state/actions';
import * as selectors from '../../../state/selectors';
import { AddContactModalComponent } from '../add-contact-modal/add-contact-modal.component';
import { FilterModel } from '@app/models/advanced-search/filter-model';
@Component({
  selector: 'app-contacts-list-reporting',
  templateUrl: './contacts-list-reporting.component.html',
  styleUrls: ['./contacts-list-reporting.component.scss'],
})
export class ContactsListReportingComponent extends ListView implements OnInit {
  public readonly gridId: GridId = GridId.ProjectContacts;
  readonly actionBar$ = this.store.select(selectors.actionBar);

  @Input() projectId;
  @Input() additionalFilter: FilterModel[] = [];
  @Input() hideNewContactButton = false;

  public gridOptions: GridOptions = {
    columnDefs: [
          {
            headerName: 'ID',
            field: 'id',
            width: 60,
            sortable: true,
            ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
            ...AGGridHelper.fixedColumnDefaultParams,
          },
          {
            headerName: 'User Name',
            field: 'userName',
            sortable: true,
            ...AGGridHelper.getCustomTextColumnFilter(),
          },
          {
            headerName: 'First Name',
            field: 'viewFirstName',
            sortable: true,
            sort: 'asc',
            ...AGGridHelper.getCustomTextColumnFilter(),
            ...AGGridHelper.nameColumnDefaultParams,
          },
          {
            headerName: 'Last Name',
            field: 'viewLastName',
            sortable: true,
            ...AGGridHelper.getCustomTextColumnFilter(),
            ...AGGridHelper.nameColumnDefaultParams,
          },
          {
            headerName: 'Organization',
            field: 'viewOrgName',
            sortable: true,
            ...AGGridHelper.getCustomTextColumnFilter(),
          },
          {
            headerName: 'Role',
            field: 'contactRole.name',
            sortable: true,
            ...AGGridHelper.nameColumnDefaultParams,
            ...AGGridHelper.getCustomTextColumnFilter(),
          },
          {
            headerName: 'Email',
            field: 'viewEmail',
            sortable: true,
            ...AGGridHelper.emailColumnDefaultParams,
            minWidth: 160,
            ...AGGridHelper.getCustomTextColumnFilter(),
          },
          {
            headerName: 'Active?',
            field: 'active',
            sortable: true,
            cellRenderer: 'activeRenderer',
            ...AGGridHelper.tagColumnDefaultParams,
          },
          {
            headerName: 'Last Updated',
            field: 'projectContact.lastUpdated',
            colId: 'caseContact.updatedOn',
            cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value, false, null, null, true),
            sortable: true,
            ...AGGridHelper.dateColumnDefaultParams,
            ...AGGridHelper.dateOnlyColumnFilter(),
            width: 150,
          },
          {
            headerName: 'Last Report Date',
            field: 'projectContact.lastReportDate',
            colId: 'lastReportDate',
            cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value, false, null, null, true),
            ...AGGridHelper.dateColumnDefaultParams,
            width: 150,
          },
          AGGridHelper.getActionsColumn({ onEditContactHandler: this.editContact.bind(this), onViewContactHandler: this.viewContact.bind(this) }),
        ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
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

  private editContact({ data }): void {
    this.modalService.show(EditContactModalComponent, {
      initialState: { contact: data, isDeficiencyReport: true },
      class: 'edit-project-contact-form-modal',
    });
  }

  private viewContact({ data }): void {
    this.modalService.show(ViewContactModalComponent, {
      initialState: { contact: data },
      class: 'view-project-contact-form-modal',
    });
  }

  ngOnInit(): void {
    this.actionBar$.pipe(first())
      .subscribe((actionBar: ActionHandlersMap) => this.store.dispatch(actions.UpdateActionBar({
        actionBar: {
          ...actionBar,
          new: {
            callback: () => this.addNew(),
            disabled: () => this.editEnabled,
            hidden: () => this.hideNewContactButton,
          },
        }
      })));
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  protected fetchData(params): void {
    this.gridParams = params;

    if (this.additionalFilter.length > 0) {
      params.request.filterModel.push(...this.additionalFilter);
    }

    this.store.dispatch(actions.GetContactsList({ projectId: this.projectId, agGridParams: params, isDeficiencyReport: true }));
  }

  public addNew(): void {
    this.modalService.show(AddContactModalComponent, { initialState: { projectId: this.projectId }, class: 'add-new-contact-modal' });
  }

  onRowDoubleClicked(data): void {
    if (!data) {
      return;
    }

    this.editContact(data);
  }

  public clearGridFilters(): void {
    this.clearFilters();
  }

  public canClearGridFilters(): boolean {
    return this.canClearFilters();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
