import { ColumnVO } from 'ag-grid-community';
import { IDictionary } from '../utils/dictionary';
import { DashboardField } from '../dashboards/dashboard-field';
import { FilterModel } from '../advanced-search/filter-model';
import { FilterTypes } from '../advanced-search/filter-types.enum';
import { SearchConditionsEnum } from '../advanced-search/search-conditions.enum';
import { ProjectOverviewFieldIdentifiers, ProductWorkflowAdvancedSearchKey } from '../enums';
import { SearchState } from '../advanced-search/search-state';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

const fieldIds: ProjectOverviewFieldIdentifiers[] = [ 1, 2, 3 ];

export class ProjectOverviewDashboardSearchOptions implements IServerSideGetRowsRequestExtended {
  startRow: number;

  endRow: number;

  rowGroupCols: ColumnVO[];

  valueCols: ColumnVO[];

  pivotCols: ColumnVO[];

  pivotMode: boolean;

  groupKeys: string[];

  filterModel: any;

  sortModel: any;

  projectId: number;

  fieldId: number;

  filterParameter: string;

  filterValue: number;

  filters?: IDictionary<string, DashboardField>;

  summaryFieldId?: number;

  public static toFilterModelDto(item: ProjectOverviewDashboardSearchOptions): FilterModel[] {
    const filters: FilterModel[] = [];
    const projectFilter: FilterModel = {
      filter: item.projectId,
      filterTo: null,
      filterType: FilterTypes.Number,
      type: SearchConditionsEnum.Equals,
      dateFrom: null,
      dateTo: null,
      key: "project.id",
    }
    filters.push(projectFilter);
    if (item.filterParameter) {
      item.filterParameter = item.filterParameter.trim();
      let productWorkflowFilter: FilterModel = {
        filter: null,
        filterTo: null,
        filterType: null,
        type: null,
        dateFrom: null,
        dateTo: null,
        key: ProductWorkflowAdvancedSearchKey.ProductWorkflow,
        conditions: [],
      };
      switch (item.filterParameter) {
        case "ProductCategoryId":
          const productCategoryFilter: FilterModel = {
            filter: item.filterValue,
            filterType: FilterTypes.Number,
            type: SearchConditionsEnum.Equals,
            key: ProductWorkflowAdvancedSearchKey.ProductCategory,
            dateFrom: null,
            dateTo: null,
            filterTo: null,
          };
          productWorkflowFilter.conditions.push(productCategoryFilter);
          break;
        case "StageId":
          productWorkflowFilter = this.getStageFilters(productWorkflowFilter, item);
          break;
        case "PhaseId":
          productWorkflowFilter = this.getPhaseFilters(productWorkflowFilter, item);
          break;
        default:
          break;
      }
      filters.push(productWorkflowFilter);
    }

    return filters;
  }

  private static getPhaseFilters(filterModel: FilterModel, item: ProjectOverviewDashboardSearchOptions): FilterModel {
    const phaseFilter: FilterModel = {
      filter: item.filterValue.toString(),
      filterType: FilterTypes.Number,
      type: SearchState.getTypeByCondition(SearchConditionsEnum.Equals),
      key: ProductWorkflowAdvancedSearchKey.Phase,
      dateFrom: null,
      dateTo: null,
      filterTo: null,
    };
    filterModel.conditions.push(phaseFilter);
    if (item.fieldId && fieldIds.indexOf(item.fieldId) > -1) {
      let ageOfPhase: FilterModel = {
        filter: null,
        filterTo: null,
        filterType: FilterTypes.Age,
        type: SearchState.getTypeByCondition(SearchConditionsEnum.LessThanDays),
        dateFrom: null,
        dateTo: null,
        key: ProductWorkflowAdvancedSearchKey.AgeOfPhase,
      }
      switch (item.fieldId) {
        case 1:
          ageOfPhase.filter = "31";
          ageOfPhase.type = SearchState.getTypeByCondition(SearchConditionsEnum.LessThanDays);
          break;
        case 2:
          ageOfPhase.filter = "31";
          ageOfPhase.filterTo = "90";
          ageOfPhase.type = SearchState.getTypeByCondition(SearchConditionsEnum.InRangeDays);
          break;
        case 3:
          ageOfPhase.filter = "90";
          ageOfPhase.type = SearchState.getTypeByCondition(SearchConditionsEnum.GreaterThanDays);
          break;
      }
      filterModel.conditions.push(ageOfPhase);
    }
    return filterModel;
  }

  private static getStageFilters(filterModel: FilterModel, item: ProjectOverviewDashboardSearchOptions): FilterModel {
    const stageFilter: FilterModel = {
      filter: item.filterValue.toString(),
      filterType: FilterTypes.Number,
      type: SearchState.getTypeByCondition(SearchConditionsEnum.Equals),
      key: ProductWorkflowAdvancedSearchKey.Stage,
      dateFrom: null,
      dateTo: null,
      filterTo: null,
    };
    filterModel.conditions.push(stageFilter);
    if (item.fieldId && fieldIds.indexOf(item.fieldId) > -1) {
      let ageOfStage: FilterModel = {
        filter: null,
        filterTo: null,
        filterType: FilterTypes.Age,
        type: SearchState.getTypeByCondition(SearchConditionsEnum.LessThanDays),
        dateFrom: null,
        dateTo: null,
        key: ProductWorkflowAdvancedSearchKey.AgeOfStage,
      }
      switch (item.fieldId) {
        case 1:
          ageOfStage.filter = "31";
          ageOfStage.type = SearchState.getTypeByCondition(SearchConditionsEnum.LessThanDays);
          break;
        case 2:
          ageOfStage.filter = "31";
          ageOfStage.filterTo = "90";
          ageOfStage.type = SearchState.getTypeByCondition(SearchConditionsEnum.InRangeDays);
          break;
        case 3:
          ageOfStage.filter = "90";
          ageOfStage.type = SearchState.getTypeByCondition(SearchConditionsEnum.GreaterThanDays);
          break;
      }
      filterModel.conditions.push(ageOfStage);
    }
    return filterModel;
  }
}
