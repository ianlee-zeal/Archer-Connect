import { Component } from '@angular/core';
import { EntityTypeEnum } from '@app/models/enums';
import { TabItem } from '@app/models';
import { Store } from '@ngrx/store';
import { SectionContainingTabsComponent } from '@app/modules/shared/_abstractions/section-containing-tabs.component';
import { TabInfoState } from '@app/modules/shared/state/tab-info/state';
import { ActivatedRoute } from '@angular/router';
import * as selectors from '../../state/selectors';
import { TaskState } from '../../state/reducer';

@Component({
  selector: 'app-task-details-section',
  templateUrl: './task-details-section.component.html',
})
export class TaskDetailsSectionComponent extends SectionContainingTabsComponent {
  entityType = EntityTypeEnum.Clients;
  private readonly tabsUrl = './tabs';

  protected readonly tabTitles = { [EntityTypeEnum.Addresses]: 'Sub-tasks' };

  private readonly relatedDocumentsCount$ = this.store.select(selectors.attachedDocumentsCount);

  constructor(
    private store: Store<TaskState>,
    tabInfoStore: Store<TabInfoState>,
    private readonly route: ActivatedRoute,
  ) {
    super(tabInfoStore);
  }

  ngOnInit(): void {
    super.ngOnInit();
    const taskId = this.route.snapshot.params.id;

    if (taskId) {
      this.tabs.push({
        title: 'Related Documents',
        link: `${this.tabsUrl}/related-documents`,
        count: this.relatedDocumentsCount$,
      });
    }
  }

  public readonly tabs: TabItem[] = [
    {
      title: 'Sub-tasks',
      link: `${this.tabsUrl}/sub-tasks`,
    },
  ];
}
