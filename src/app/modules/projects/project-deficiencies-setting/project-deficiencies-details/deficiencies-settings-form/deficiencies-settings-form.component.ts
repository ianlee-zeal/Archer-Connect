import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import { UntypedFormBuilder, Validators } from '@angular/forms';
import { IDeficiencySettingsTemplateUpdate } from '@app/models/deficiencies/deficiency-settings-template-update';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { TemplateActionEnum } from '../../enums/template-actions.enum';
import { selectors, actions } from '../state';
import { DeficienciesTemplateDetailsState } from '../state/reducers';
import { DeficiencySettingsTemplateService } from '../../services/deficiency-settings-template.service';

@Component({
  selector: 'app-project-deficiencies-form',
  templateUrl: './deficiencies-settings-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDeficienciesTemplateFormComponent implements OnInit, OnDestroy {
  public readonly canEdit$ = this.store.select(selectors.canEdit);
  public readonly deficiencyTemplate$ = this.store.select(selectors.deficiencyTemplate);

  private deficiencyTemplate: DeficiencySettingsTemplate;

  private ngUnsubscribe$ = new Subject<void>();
  form = this.fb.group({
    templateName: ['', Validators.required],
    isDefaultTemplate: [true],
  });

  constructor(
    private readonly store: Store<DeficienciesTemplateDetailsState>,
    private readonly fb: UntypedFormBuilder,
    private readonly deficiencySettingsTemplateService: DeficiencySettingsTemplateService,
  ) {}

  ngOnInit(): void {
    this.deficiencyTemplate$.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter((item: DeficiencySettingsTemplate) => item != null),
    )
      .subscribe((template: DeficiencySettingsTemplate) => {
        this.deficiencyTemplate = template;

        this.store.dispatch(actions.UpdateTemplateData({ data: {
          templateName: template.templateName,
          isDefault: !!(this.deficiencyTemplate.isOnlySystemDefaultExist || template.isDefault),
        } as IDeficiencySettingsTemplateUpdate }));
        if (template.isOnlySystemDefaultExist || (template.isDefault && this.deficiencySettingsTemplateService.actionOnPage !== TemplateActionEnum.Copy)) {
          const ctrl = this.form.get('isDefaultTemplate');
          ctrl.disable();
        } else if (this.deficiencySettingsTemplateService.actionOnPage === TemplateActionEnum.Copy) {
          // https://archersystems.atlassian.net/browse/AC-19531
          this.form.patchValue({
            isDefaultTemplate: false,
          });
        }
        if (this.deficiencySettingsTemplateService.actionOnPage !== TemplateActionEnum.Copy) {
          this.form.patchValue({
            templateName: !template.isSystemDefault ? template.templateName : '',
            isDefaultTemplate: template.isDefault,
          });
        }
      });
    this.form.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        withLatestFrom(this.deficiencyTemplate$),
        filter(([, template] : [any, DeficiencySettingsTemplate]) => template != null),
      )
      .subscribe(([formData, template]: [any, DeficiencySettingsTemplate]) => {
        this.store.dispatch(actions.UpdateTemplateData({ data: {
          templateName: formData.templateName,
          isDefault: this.deficiencyTemplate.isOnlySystemDefaultExist || (template.isDefault && this.deficiencySettingsTemplateService.actionOnPage !== TemplateActionEnum.Copy) ? true : formData.isDefaultTemplate,
        } as IDeficiencySettingsTemplateUpdate }));
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
