import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, ViewRef } from '@angular/core';
import { TabItem } from '@app/models';
import { EntityTypeEnum, IntegrationStatus, JobNameEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { ModalService, PermissionService } from '@app/services';
import { Store } from '@ngrx/store';
import * as selectors from './state/selectors';
import { LienDeficienciesState } from './state/reducer';
import { lienDeficienciesGridSelectors } from './lien-deficiencies-grid/state/selectors';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IntegrationJob } from '@app/models/lien-deficiencies/integration-job';
import { ConfirmationModalComponent } from '../shared/confirmation-modal/confirmation-modal.component';
import { EnumToArrayPipe } from '../shared/_pipes';
import { PusherService } from '@app/services/pusher.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CommonHelper, StringHelper } from '@app/helpers';
import { RefreshLienDeficienciesGrid, Reset, SetStatus, StartRun } from './lien-deficiencies-grid/state/actions';
import { IntegrationDto } from '@app/models/lien-deficiencies/integrationDto';
import { Channel } from 'pusher-js';
import { statusesByEntityType } from '@app/state';
import { SelectOption } from '../shared/_abstractions/base-select';
import { GetStatuses } from '@app/state/root.actions';
import { Status } from '@app/models/status';
import { ActionHandlersMap } from '../shared/action-bar/action-handlers-map';
import { UpdateActionBar } from './state/actions';

@Component({
  selector: 'app-lien-deficiencies',
  templateUrl: './lien-deficiencies.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LienDeficienciesComponent implements OnInit {
  private readonly runIntegrationJob$ = this.store.select(lienDeficienciesGridSelectors.runIntegrationJob);
  private readonly statusOpts$ = this.store.select(statusesByEntityType({ entityType: EntityTypeEnum.Integrations }));
  public actionbar$ = this.store.select(selectors.actionBar);
  private statusOpts: SelectOption[] = [];
  public runIntegrationJob: IntegrationJob;
  ngUnsubscribe$ = new Subject<void>();
  public bsModalRef: BsModalRef;
  channel: Channel;

  readonly actionBar: ActionHandlersMap = {
    startRun: {
      callback: () => this.openConfirmationModal(),
      permissions: PermissionService.create(PermissionTypeEnum.Integrations, PermissionActionTypeEnum.Create),
    },
  };

  protected readonly tabsUrl = './tabs';

  public readonly tabs: TabItem[] = [
    {
      title: 'Lien Deficiencies',
      link: `${this.tabsUrl}/lien-deficiencies`,
      permission: PermissionService.create(PermissionTypeEnum.Integrations, PermissionActionTypeEnum.Read),
    },
    {
      title: 'Lien Deficiencies Management',
      link: `${this.tabsUrl}/lien-deficiencies-management`,
      permission: PermissionService.create(PermissionTypeEnum.Integrations, PermissionActionTypeEnum.Read),
    },
  ];

  constructor(
    private readonly store: Store<LienDeficienciesState>,
    private readonly changeRef: ChangeDetectorRef,
    private readonly modalService: ModalService,
    private readonly enumToArrayPipe: EnumToArrayPipe,
    private pusher: PusherService,
  ) {}

  public ngOnInit(): void {
    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      this.changeRef.detectChanges();
    }
    this.store.dispatch(UpdateActionBar({ actionBar: this.actionBar }));

    this.statusOpts$.pipe(
      filter(s => s.length && !this.statusOpts.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(opts => {
      this.statusOpts.push(...opts.map(o => ({ id: o.id, name: o.name })));
    });

    if (!this.statusOpts.length) {
      this.store.dispatch(GetStatuses({ entityType: EntityTypeEnum.Integrations }));
    }

    this.runIntegrationJob$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(runIntegrationJob => {
      this.runIntegrationJob = runIntegrationJob;
    });
  }


  private openConfirmationModal(): void {
    const initialState = {
      title: 'Confirm Run',
      message: 'Are you sure you want to start the run?',
      buttonOkText: 'Yes',
      showConfirmMsgClass: false,
      onRespond: (confirmed: boolean) => this.onConfirmationModalRespond(confirmed),
    };

    this.bsModalRef = this.modalService.show(ConfirmationModalComponent, { initialState });
  }

  private onConfirmationModalRespond(confirmed: boolean) {
    if (confirmed) {
      this.startRun();
    }

    this.bsModalRef.hide();
  }

  private startRun() {
    const id = CommonHelper.createEntityUniqueId();

    const channelName = StringHelper.generateChannelName(
      JobNameEnum.IntegrationRunCreation,
      id,
      EntityTypeEnum.Integrations,
    );

    this.subscribeToRunIntegrationPusher(channelName, () => {
      this.store.dispatch(StartRun({ integrationDto: IntegrationDto.toInitial({ channelName }) }));
    });
  }

  private unsubscribeFromChannel(): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
      this.channel = null;
    }
  }

  private subscribeToRunIntegrationPusher(channelName: string, onSubscribedCallback: () => void = null) {
    this.unsubscribeFromChannel();

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArrayPipe.transformToKeysArray(IntegrationStatus),
      this.runIntegrationPusherCallback.bind(this),
      onSubscribedCallback,
    );
  }

  private runIntegrationPusherCallback(data: any, event): void {
    const status = this.statusOpts.find(x => x.name === event);
    if (status) {
      this.store.dispatch(SetStatus({ status: Status.toModel(status) }));
    }

    const statusId = Number(status?.id);

    if (IntegrationStatus.Scheduled === statusId) {
      this.store.dispatch(RefreshLienDeficienciesGrid());
    }

    if ([IntegrationStatus.Completed, IntegrationStatus.Failed].includes(statusId)) {
      this.store.dispatch(RefreshLienDeficienciesGrid());
      this.unsubscribeFromChannel();
      this.store.dispatch(Reset());
    }
  }

  public ngOnDestroy(): void {
    this.store.dispatch(UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

}
