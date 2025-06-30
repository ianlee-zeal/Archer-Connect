import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, ViewRef } from '@angular/core';
import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { Store } from '@ngrx/store';
import * as auditorSelectors from './state/selectors';
import { AuditorState } from './state/reducer';

@Component({
  selector: 'app-auditor',
  templateUrl: './auditor.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AuditorComponent implements OnInit {
  public actionbar$ = this.store.select(auditorSelectors.actionBar);

  protected readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Auditor',
      link: `${this.tabsUrl}/audit-batches`,
      permission: PermissionService.create(PermissionTypeEnum.DataProcessingAuditor, PermissionActionTypeEnum.Read),
    },
  ];

  constructor(
    private readonly store: Store<AuditorState>,
    private readonly changeRef: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {
    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      this.changeRef.detectChanges();
    }
  }
}
