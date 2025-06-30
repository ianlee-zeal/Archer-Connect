import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IdValue } from '@app/models';
import { ControllerEndpoints, FileImportTemplateTypes } from '@app/models/enums';
import { FormulaSets } from '@app/models/formula/formula-sets';
import { IdValuePrimary } from '@app/models/idValuePrimary';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings/claim-settlement-ledger-settings';
import { RestService } from './_rest.service';

@Injectable({ providedIn: 'root' })
export class ClaimSettlementLedgerSettingsService extends RestService<any> {
  endpoint = ControllerEndpoints.ClaimSettlementLedgerSettings;

  public getFormulaSets(): Observable<FormulaSets[]> {
    return this.api.get(`${this.endpoint}/formula-sets`);
  }

  public getFormulaSet(formulaSetId: number): Observable<FormulaSets> {
    return this.api.get(`${this.endpoint}/formula-set/${formulaSetId}`);
  }

  public getFormulaSetByProjectId(projectId: number): Observable<FormulaSets> {
    return this.api.get(`${this.endpoint}/formula-set-by-project/${projectId}`);
  }

  public getByProjectId(projectId: number): Observable<ClaimSettlementLedgerSettings> {
    return this.api.get(`${this.endpoint}/cases/${projectId}`);
  }

  public update(entityTypeId: number, claimSettlementLedgerSettings: ClaimSettlementLedgerSettings): Observable<ClaimSettlementLedgerSettings> {
    return this.api.put(`${this.endpoint}/${claimSettlementLedgerSettings.entityId}/entity-types/${entityTypeId}`, claimSettlementLedgerSettings);
  }

  public getDocumentImportTemplates(): Observable<Record<FileImportTemplateTypes, IdValue[]>> {
    return this.api.get(`${this.endpoint}/document-import-templates`);
  }

  public getElectronicDeliveryProviders(): Observable<IdValue[]> {
    return this.api.get(`${this.endpoint}/electronic-delivery-providers`);
  }

  public getClosingStatementTemplates(projectId?: number, isProjectAssociated?: boolean): Observable<IdValue[]> {
    const id = isProjectAssociated ? `${projectId}` : '';
    return this.api.get(`${this.endpoint}/closing-statements-templates/${id}`);
  }

  public getFormulaModes(): Observable<IdValue[]> {
    return this.api.get(`${this.endpoint}/formula-modes`);
  }

  public getDigitalPaymentProvidersOptions(): Observable<IdValue[]> {
    return this.api.get(`${this.endpoint}/payment-providers`);
  }

  public getDisbursementsTemplates(templateId: FileImportTemplateTypes): Observable<IdValuePrimary[]> {
    return this.api.get(`${this.endpoint}/export-templates/template/${templateId}`);
  }
}
