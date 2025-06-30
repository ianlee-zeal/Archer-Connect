import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  LienService,
  ProjectOverviewDashboardConfig,
  AGResponse,
  DashboardHeaderRow,
  ColumnExport,
  InfoBlockItem,
  IdValue,
  Project,
} from '@app/models';
import {
  ProjectOverviewDashboardSearchOptions,
  ProjectOverviewDashboardClaimantItem,
  ProjectOverviewDashboardClaimantDetails,
} from '@app/models/projects';
import {
  DashboardData,
  FinalizationCount,
  FinalizationCountData,
  FinalizationCountRequestOptions,
} from '@app/models/dashboards';

import { ProjectDetails } from '@app/models/projects/project-details';
import { ClientLiensRequestExport } from '@app/models/liens/client-liens-request-export';
import { ProductSummaryRequest } from '@app/models/liens/product-summary-request';
import { DisbursementGroup } from '@app/models/disbursement-group';
import { DisbursementGroupType } from '@app/models/disbursement-group-type';
import { Stage } from '@app/models/stage';
import { Page } from '@app/models/page';
import { ProjectDto } from '@app/models/projects/project-dto';
import { ISearchOptions } from '@app/models/search-options';
import { DeficienciesWidgetData } from '@app/models/dashboards/deficiencies-response';
import { ProjectCounts } from '@app/models/projects/project-counts';
import { HttpContext } from '@angular/common/http';
import { BYPASS_SPINNER } from '@app/tokens/http-context-tokens';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { ProjectCopySettings } from '@app/models/scope-of-work/project-copy-settings';
import { EntityTypeEnum } from '@app/models/enums/entity-type.enum';
import { ClientsForQsfDashboardRequest } from '@app/models/liens/clients-for-qsf-dashboard-request';
import { ClientsForQsfDashboardRequestExport } from '@app/models/liens/clients-for-qsf-dashboard-request-export';
import { ClientsByAttorneyPmtStatusSummaryRequest } from '@app/models/liens/clients-attorney-pmt-status-summary-request';
import { RestService } from './_rest.service';
import { DashboardDataService } from '../dashboard-data.service';
import { ApiService } from './_api.service';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { ReportSchedule } from '@app/models/projects/report-schedule';
import { StringHelper } from '@app/helpers';
import { IVoidClosingStatementRequest } from '@app/models/closing-statement/void-closing-Statement-request';

@Injectable({ providedIn: 'root' })
export class ProjectsService extends RestService<any> {
  /**
   * Service endpoint value
   *
   * @memberof ProjectsService
   */
  endpoint = '/cases';
  disbursementGroupEndpoint = '/disbursement-groups';
  attorney = '/attorney';
  lightList = '/light-list';
  schedule = '/integrations';
  electronicDelivery = '/electronic-delivery';

  /**
   * Creates an instance of ProjectsService.
   * @param {ApiService} api - api service
   * @param {DashboardDataService} dashboardDataService - dashboard data service
   * @memberof ProjectsService
   */
  constructor(
    api: ApiService,
    private readonly dashboardDataService: DashboardDataService,
  ) {
    super(api);
  }

  getProjectsList(data: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/list`, data);
  }

  getClients(
    gridParams: IServerSideGetRowsRequestExtended,
    projectId: number,
  ): Observable<any> {
    return this.api.post<any>(
      `${this.endpoint}/${projectId}/clients`,
      gridParams,
    );
  }

  getProjectOverviewDashboardClaimantStatistics(
    projectId: number,
    bypassSpinner?: boolean,
  ): Observable<InfoBlockItem[]> {
    const context = new HttpContext().set(BYPASS_SPINNER, bypassSpinner ?? false);
    return this.api
      .get<Observable<DashboardHeaderRow[]>>(
      `${this.endpoint}/${projectId}/case-overview-dashboard-claimant-statistic`, undefined, context
    )
      .pipe(
        map((statistics: DashboardHeaderRow[]) => this.dashboardDataService.toStatisticsData(statistics)),
      );
  }

  getProjectCounts(projectId: number): Observable<ProjectCounts> {
    const context = new HttpContext().set(BYPASS_SPINNER, true);
    return this.api.get<Observable<ProjectCounts>>(
      `${this.endpoint}/${projectId}/project-counts`,
      null,
      context,
    );
  }

  getProjectOverviewDashboardClaimantDetails(
    projectId: number,
  ): Observable<DashboardData> {
    return this.api
      .get<Observable<DashboardData>>(
      `${this.endpoint}/${projectId}/case-overview-dashboard-claimant-details`,
    )
      .pipe(
        map((result: ProjectOverviewDashboardClaimantDetails) => this.dashboardDataService.toDashboardData(
          result.items,
          new ProjectOverviewDashboardConfig(result.expandable),
          result.expandable,
        )),
      );
  }

  getProjectOverviewDashboardClaimantDetailsByPhase(
    projectId: number,
    bypassSpinner?: boolean,
  ): Observable<DashboardData> {
    const context = new HttpContext().set(BYPASS_SPINNER, bypassSpinner ?? false);
    return this.api
      .get<Observable<DashboardData>>(
      `${this.endpoint}/${projectId}/case-overview-dashboard-claimant-details-by-phase`, undefined, context
    )
      .pipe(
        map((result: ProjectOverviewDashboardClaimantDetails) => this.dashboardDataService.toDashboardDataByPhase(
          result.items,
          new ProjectOverviewDashboardConfig(result.expandable),
          result.expandable,
        )),
      );
  }

  getFinalizationCounts(projectId: number): Observable<FinalizationCount[]> {
    return this.api
      .get<Observable<FinalizationCountData[]>>(
      `${this.endpoint}/${projectId}/case-overview-dashboard-finalization-counts`,
    )
      .pipe(
        map((result: FinalizationCountData[]) => result.map((item: FinalizationCountData) => FinalizationCount.toModel(item))),
      );
  }

  getFinalizationCountsByDates(
    projectId: number,
    productCategoryId: number,
    from: Date,
    to: Date,
  ): Observable<FinalizationCount> {
    return this.api
      .post<FinalizationCountRequestOptions>(
      `${this.endpoint}/${projectId}/case-overview-dashboard-finalization-count`,
      { projectId, productCategoryId, from, to },
    )
      .pipe(
        map((result: FinalizationCountData) => FinalizationCount.toModel(result)),
      );
  }

  getDeficienciesWidgetData(
    projectId: number,
    bypassSpinner?: boolean,
  ): Observable<DeficienciesWidgetData> {
    const context = new HttpContext().set(BYPASS_SPINNER, bypassSpinner ?? false);
    return this.api.get<Observable<DeficienciesWidgetData>>(
      `${this.endpoint}/${projectId}/case-overview-dashboard-deficiencies`, undefined, context
    );
  }

  getProjectOverviewDashboardClaimants(
    request: ProjectOverviewDashboardSearchOptions,
  ): Observable<AGResponse<ProjectOverviewDashboardClaimantItem>> {
    return this.api.post<ProjectOverviewDashboardSearchOptions>(
      `${this.endpoint}/case-overview-dashboard-claimants`,
      request,
    );
  }

  getProjectDetails(projectId: number): Observable<ProjectDetails> {
    return this.api.get<Observable<ProjectDetails>>(
      `${this.endpoint}/${projectId}/case-details-dashboard`,
    );
  }

  getServices(projectId: number): Observable<[LienService]> {
    return this.api.get<Observable<LienService[]>>(
      `${this.endpoint}/${projectId}/services`,
    );
  }

  //* *** Product Dashboard ***/

  public getProductStatusesSummary(
    rootProductCategoryId: number,
    projectId: number,
    lienType: number[],
    lienPhases: number[],
    isReleaseInGoodOrder?: boolean,
    bypassSpinner?: boolean,
  ): Observable<any> {
    const params: ProductSummaryRequest = {
      rootProductCategoryId,
      productTypes: lienType,
      productPhases: lienPhases,
      isReleaseInGoodOrder,
    };
    const context = new HttpContext().set(BYPASS_SPINNER, bypassSpinner ?? false);
    return this.api.post<any>(
      `${this.endpoint}/${projectId}/product-statuses-summary`,
      params,
      context,
    );
  }

  public GetProductPhasesSummary(
    rootProductCategoryId: number,
    projectId: number,
    lienType: number[],
    lienPhases: number[],
    clientStages: number[],
    isReleaseInGoodOrder?: boolean,
  ): Observable<any> {
    const params: ProductSummaryRequest = {
      rootProductCategoryId,
      productTypes: lienType,
      productPhases: lienPhases,
      productStages: clientStages,
      isReleaseInGoodOrder,
    };

    return this.api.post<any>(
      `${this.endpoint}/${projectId}/product-phases-summary`,
      params,
    );
  }

  public GetProductTypesSummary(
    rootProductCategoryId: number,
    projectId: number,
    lienPhases: number[],
    clientStages: number[],
  ): Observable<any> {
    const params: ProductSummaryRequest = {
      rootProductCategoryId,
      productPhases: lienPhases,
      productStages: clientStages,
    };

    return this.api.post<any>(
      `${this.endpoint}/${projectId}/product-types-summary`,
      params,
    );
  }

  public getTotalPaymentChartData(
    projectId: number,
    bypassSpinner?: boolean,
  ): Observable<any> {
    const context = new HttpContext().set(BYPASS_SPINNER, bypassSpinner ?? false);
    return this.api.post<any>(`${this.endpoint}/${projectId}/total-payment-chart-data`, {}, context);
  }

  public getClientsByAttorneyPmtStatusSummary(
    projectId: number,
    lienPhases: number[],
    clientStages: number[],
    bypassSpinner?: boolean,
  ): Observable<any> {
    const params: ClientsByAttorneyPmtStatusSummaryRequest = {
      productPhases: lienPhases,
      productStages: clientStages,
    };
    const context = new HttpContext().set(BYPASS_SPINNER, bypassSpinner ?? false);
    return this.api.post<any>(
      `${this.endpoint}/${projectId}/clients-by-attorney-pmt-status`,
      params,
      context,
    );
  }

  public getClientsByProbate(
    gridParams: IServerSideGetRowsRequestExtended,
    projectId: number,
    rootProductCategoryId: number,
    lienType: number[],
    lienPhases: number[],
    clientStages: number[],
  ): Observable<any> {
    const requestParams = {
      rootProductCategoryId,
      lienTypeGroups: lienType,
      lienPhases,
      clientStages,
      searchOptions: gridParams,
    };

    return this.api.post<any>(
      `${this.endpoint}/${projectId}/clients-by-probate`,
      requestParams,
    );
  }

  public getClientsByRelease(
    gridParams: IServerSideGetRowsRequestExtended,
    projectId: number,
    rootProductCategoryId: number,
    lienType: number[],
    lienPhases: number[],
    clientStages: number[],
    isReleaseInGoodOrder: boolean,
  ): Observable<any> {
    const requestParams = {
      rootProductCategoryId,
      lienTypeGroups: lienType,
      lienPhases,
      clientStages,
      searchOptions: gridParams,
      isReleaseInGoodOrder,
    };

    return this.api.post<any>(
      `${this.endpoint}/${projectId}/clients-by-release`,
      requestParams,
    );
  }

  public getClientsByBankruptcy(
    gridParams: IServerSideGetRowsRequestExtended,
    projectId: number,
    rootProductCategoryId: number,
    lienType: number[],
    lienPhases: number[],
    clientStages: number[],
  ): Observable<any> {
    const requestParams = {
      rootProductCategoryId,
      lienTypeGroups: lienType,
      lienPhases,
      clientStages,
      searchOptions: gridParams,
    };

    return this.api.post<any>(
      `${this.endpoint}/${projectId}/clients-by-bankruptcy`,
      requestParams,
    );
  }

  public getClientsByLienResolution(
    gridParams: IServerSideGetRowsRequestExtended,
    projectId: number,
    rootProductCategoryId: number,
    lienType: number[],
    lienPhases: number[],
    clientStages: number[],
  ): Observable<any> {
    const requestParams = {
      rootProductCategoryId,
      lienTypeGroups: lienType,
      lienPhases,
      clientStages,
      searchOptions: gridParams,
    };

    return this.api.post<any>(
      `${this.endpoint}/${projectId}/clients-by-lien-resolution`,
      requestParams,
    );
  }

  public getClientsForQsfAdmin(
    gridParams: IServerSideGetRowsRequestExtended,
    projectId: number,
    attorneyPaymentStatuses: number[],
    clientStages: number[],
    bypassSpinner?: boolean,
  ): Observable<any> {
    const requestParams: ClientsForQsfDashboardRequest = {
      attorneyPaymentStatuses,
      clientStages,
      searchOptions: gridParams,
    };
    const context = new HttpContext().set(BYPASS_SPINNER, bypassSpinner ?? false);
    return this.api.post<any>(
      `${this.endpoint}/${projectId}/clients-for-qsf-admin-dashboard`,
      requestParams,
      context,
    );
  }

  public exportClientsForQsfAdmin(
    projectId: number,
    clientLiensExport: ClientsForQsfDashboardRequestExport,
  ): Observable<string> {
    return this.api.post(
      `${this.endpoint}/${projectId}/export/clients-qsf-admin`,
      clientLiensExport,
    );
  }

  public exportClients(
    projectId: number,
    clientLiensExport: ClientLiensRequestExport,
  ): Observable<string> {
    return this.api.post(
      `${this.endpoint}/${projectId}/export/clients-services`,
      clientLiensExport,
    );
  }

  public exportDashboard(
    name: string,
    searchOptions: ProjectOverviewDashboardSearchOptions,
    columns: ColumnExport[],
    channelName: string,
  ): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    return this.api.post(`${this.endpoint}/export/dashboard`, requestParams);
  }

  public export(
    id: number,
    name: string,
    searchOptions: IServerSideGetRowsRequestExtended,
    columns: ColumnExport[],
    channelName: string,
  ): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    return this.api.post(`${this.endpoint}/${id}/export`, requestParams);
  }

  public downloadDocument(id: number, fileName?: string): Observable<File> {
    if (fileName) {
      return this.api.getFile(`${this.endpoint}/export/${id}`, fileName);
    }
    return this.api.getFile(`${this.endpoint}/export/${id}`);
  }

  public exportProjectOrgs(
    id: number,
    name: string,
    searchOptions: IServerSideGetRowsRequestExtended,
    columns: ColumnExport[],
    channelName: string,
  ): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    return this.api.post(
      `${this.endpoint}/${id}/export/organizations`,
      requestParams,
    );
  }

  public exportClosingStatementList(
    id: number,
    name: string,
    searchOptions: ISearchOptions,
    columns: ColumnExport[],
    channelName: string,
  ): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };

    return this.api.post(
      `${this.endpoint}/${id}/export/closing-statements`,
      requestParams,
    );
  }

  public exportProjectsList(
    name: string,
    searchOptions: IServerSideGetRowsRequestExtended,
    columns: ColumnExport[],
    channelName: string,
  ): Observable<string> {
    const requestParams = {
      name,
      searchOptions,
      columns,
      channelName,
    };
    return this.api.post(
      `${this.endpoint}/export/projects-list`,
      requestParams,
    );
  }

  public GetReleaseInGoodOrderSummary(
    rootProductCategoryId: number,
    projectId: number,
    lienPhases: number[],
    clientStages: number[],
  ): Observable<any> {
    const params: ProductSummaryRequest = {
      rootProductCategoryId,
      productPhases: lienPhases,
      productStages: clientStages,
    };

    return this.api.post<any>(
      `${this.endpoint}/${projectId}/release-order-summary`,
      params,
    );
  }

  public createProject(project: Partial<ProjectDto>): Observable<Project> {
    return this.api.post<Partial<ProjectDto>>(`${this.endpoint}`, project);
  }

  public getTypes(): Observable<IdValue[]> {
    return this.api.get<Observable<IdValue[]>>(`${this.endpoint}/types`);
  }

  public searchSettlementsOptions(searchTerm: string): Observable<IdValue[]> {
    return this.api.get<Observable<IdValue[]>>(
      `${this.endpoint}/settlements-light?searchTerm=${searchTerm}`,
    );
  }

  public searchAttorneysOptions(searchTerm: string): Observable<IdValue[]> {
    return this.api.get<Observable<IdValue[]>>(
      `${this.attorney}/attorneys-light?searchTerm=${searchTerm}`,
    );
  }

  public getDisbursementGroupList(
    searchOptions: IServerSideGetRowsRequestExtended,
    projectId: number,
  ): Observable<Page<any>> {
    const newSearchOptions = { ...searchOptions };
    if (!newSearchOptions.filterModel) {
      newSearchOptions.filterModel = [];
    }
    newSearchOptions.filterModel.push(new FilterModel({
      filter: projectId,
      filterType: 'number',
      key: 'caseId',
      type: 'equals',
    }));
    return this.api.post<any>(
      `${this.disbursementGroupEndpoint}/list`,
      newSearchOptions,
    );
  }

  public getDisbursementGroup(
    disbursementGroupId: number,
  ): Observable<DisbursementGroup> {
    return this.api.get<any>(
      `${this.disbursementGroupEndpoint}/${disbursementGroupId}`,
    );
  }

  public createDisbursementGroup(disbursementGroup: any): Observable<any> {
    return this.api.post<any>(
      `${this.disbursementGroupEndpoint}`,
      disbursementGroup,
    );
  }

  public updateDisbursementGroup(disbursementGroup: any): Observable<any> {
    return this.api.put<any>(
      `${this.disbursementGroupEndpoint}`,
      disbursementGroup,
    );
  }

  public deleteDisbursementGroup(disbursementGroupId: number): Observable<any> {
    return this.api.delete<any>(
      `${this.disbursementGroupEndpoint}/${disbursementGroupId}`,
    );
  }

  public getDisbursementGroupTypes(): Observable<DisbursementGroupType[]> {
    return this.api.get<any>(`${this.disbursementGroupEndpoint}/types`);
  }

  public getDisbursementGroupStages(): Observable<Stage[]> {
    return this.api.get<any>(`${this.disbursementGroupEndpoint}/stages`);
  }

  public getDisbursementGroups(
    entityId: number,
    removeProvisionals: boolean,
  ): Observable<any> {
    return this.api.get(
      `${this.disbursementGroupEndpoint}/${entityId}/disbursement-groups-light/${removeProvisionals}`,
    );
  }

  public getFormulaSet(id: number): Observable<any> {
    return this.api.get(`${this.endpoint}/${id}/formula-set`);
  }

  public getClosingStatement(
    caseId: number,
    params: IServerSideGetRowsRequestExtended,
  ): Observable<any> {
    return this.api.post<any>(
      `${this.endpoint}/${caseId}/closing-statements`,
      params,
    );
  }

  public getBatchDetails(
    caseId: number,
    batchId: number,
    documentId: number,
  ): Observable<any> {
    return this.api.get(
      `${this.endpoint}/${caseId}/closing-statement-batch/${batchId}/documents/delivery/${documentId}`,
    );
  }

  public updateQcStatus(
    batchId: number,
    qcStatus: number,
  ): Observable<any> {
    return this.api.put(
      `${this.endpoint}/closing-statement-batch/${batchId}/documents/delivery/qc-status`,
      qcStatus,
    );
  }

  public getClosingStatementDoc(docId: number): Observable<any> {
    return this.api.getFile(
      `${this.endpoint}/download-closing-statement/${docId}`,
    );
  }

  public getClosingStatementBatch(batchId: number): Observable<any> {
    const entityType = EntityTypeEnum.DocumentGeneration;
    return this.api.getFile(`${this.endpoint}/download-closing-statement-batch/${batchId}?entityType=${entityType}`);
  }

  public downloadClosingStatementBatchLog(batchId: number): Observable<any> {
    const entityType = EntityTypeEnum.DocuSign;
    return this.api.getFile(`${this.endpoint}/download-closing-statement-batch/${batchId}?entityType=${entityType}`);
  }

  public getPrimaryFirm(entityId: number): Observable<IdValue> {
    return this.api.get<IdValue>(
      `${this.endpoint}/${entityId}/primary-firm-id`,
    );
  }

  public getDeficiencySettingsTemplatesByProjectId(
    projectId: number,
  ): Observable<DeficiencySettingsTemplate[]> {
    return this.api.get<DeficiencySettingsTemplate[]>(
      `${this.endpoint}/${projectId}/deficiency-settings-templates`,
    );
  }

  public getProjectCasesList(
    params: Partial<IServerSideGetRowsRequestExtended>,
  ): Observable<Page<IdValue>> {
    return this.api.post(`${this.endpoint}${this.lightList}`, params);
  }

  public copySettings(
    projectId: string,
    data: ProjectCopySettings,
  ): Observable<any> {
    return this.api.post(`${this.endpoint}/${projectId}/copy-settings`, data);
  }

  public exportOrganizationPaymentStatuses(
    projectId: number,
    orgId: number,
    searchOptions: IServerSideGetRowsRequestExtended,
    name: string,
    columns: ColumnExport[],
    channelName: string,
  ): Observable<any> {
    const request = {
      searchOptions,
      columns,
      channelName,
      name,
    };

    return this.api.post(`${this.endpoint}/${projectId}/export/org-payment-statuses?orgId=${orgId}`, request);
  }

  public searchProjects(orgId: number, request: IServerSideGetRowsRequestExtended): Observable<any> {
    return this.api.post(`${this.endpoint}/${orgId}/search-by-org`, request);
  }

  /** Report Settings */
  public scheduleReport(ScheduleRequestDto: ReportSchedule): Observable<any> {
    return this.api.post<any>(`${this.schedule}/schedule-report`, ScheduleRequestDto);
  }

  public getScheduledReports(request: IServerSideGetRowsRequestExtended, caseId: number): Observable<any> {
    return this.api.post(`${this.endpoint}/scheduled-reports-search${StringHelper.queryString({ caseId })}`, request);
  }

  public getReportSchedule(id: number): Observable<ReportSchedule> {
    return this.api.get(`${this.schedule}/schedule/${id}`);
  }

  public updateReportSchedule(reportSchedule: ReportSchedule): Observable<ReportSchedule> {
    return this.api.put(`${this.schedule}/update-schedule`, reportSchedule);
  }

  public VoidClosingStatments(voidClosingStatementRequest:IVoidClosingStatementRequest): Observable<any> {
    return this.api.put(`${this.electronicDelivery}/cancel`, voidClosingStatementRequest);
  }
}
