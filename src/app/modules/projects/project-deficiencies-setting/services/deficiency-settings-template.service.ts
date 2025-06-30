import { Injectable } from '@angular/core';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { MessageService } from '@app/services';
import { Observable } from 'rxjs';
import { DeficiencySettingsService } from '@app/services/api/deficiency-settings.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { IDeficiencySettingsTemplateUpdate } from '@app/models/deficiencies/deficiency-settings-template-update';
import { DeficienciesTemplateDetailsState } from '../project-deficiencies-details/state/reducers';
import { actions } from '../project-deficiencies-details/state';
import { actions as gridActions } from '../project-deficiencies-grid/state';
import { TemplateActionEnum } from '../enums/template-actions.enum';

@Injectable({ providedIn: 'root' })
export class DeficiencySettingsTemplateService {
  constructor(
    private readonly messageService: MessageService,
    private readonly deficiencySettingsService: DeficiencySettingsService,
    private readonly store: Store<DeficienciesTemplateDetailsState>,
  ) {

  }

  public templateId: number;
  public actionOnPage: TemplateActionEnum;

  initRouting(snapshot: ActivatedRouteSnapshot): void {
    this.templateId = +snapshot.params.id || 0;
    this.actionOnPage = snapshot.params.action || TemplateActionEnum.Read;

    switch (this.actionOnPage) {
      case TemplateActionEnum.Copy:
      case TemplateActionEnum.New:
      case TemplateActionEnum.Edit:
        this.store.dispatch(actions.SetEditFlag({ canEdit: true }));
        break;
    }
  }

  canEditTemplate(item: DeficiencySettingsTemplate): boolean {
    return !item.isSystemDefault;
  }

  canSetDefaultTemplate(item: DeficiencySettingsTemplate): boolean {
    return !item.isSystemDefault;
  }

  showModalProjectSettingRequired(): Observable<boolean> {
    return this.messageService.showConfirmationDialog('Project Settings Required', 'It looks like you need to create your Project Settings.  Click Ok to review the system defaults and save or edit as your project settings.');
  }

  openTemplate(canEdit: boolean, action: TemplateActionEnum, templateId?: number): void {
    this.store.dispatch(gridActions.GoToTemplateDetails({ id: templateId, canEdit, action }));
  }

  chooseSendingMethod(param: IDeficiencySettingsTemplateUpdate): Observable<DeficiencySettingsTemplate> {
    switch (this.actionOnPage) {
      case TemplateActionEnum.Copy:
      case TemplateActionEnum.New:
        return this.deficiencySettingsService.createDeficiencyTemplate(param);
      default:
        return this.deficiencySettingsService.updateDeficiencyTemplate(param);
    }
  }
}
