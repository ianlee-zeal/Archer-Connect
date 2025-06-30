import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, ViewRef } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { Store } from '@ngrx/store';
import * as auditorSelectors from './state/selectors';
import { LienFinalizationState } from './state/reducer';

@Component({
  selector: 'app-lien-finalization',
  templateUrl: './lien-finalization.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LienFinalizationComponent implements OnInit {
  public actionbar$ = this.store.select(auditorSelectors.actionBar);

  protected readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Lien Finalization',
      link: `${this.tabsUrl}/lien-finalization`,
      permission: PermissionService.create(PermissionTypeEnum.LienFinalizationTool, PermissionActionTypeEnum.Read),
    },
  ];

  constructor(
    private readonly store: Store<LienFinalizationState>,
    private readonly changeRef: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {
    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      this.changeRef.detectChanges();
    }
  }
}
