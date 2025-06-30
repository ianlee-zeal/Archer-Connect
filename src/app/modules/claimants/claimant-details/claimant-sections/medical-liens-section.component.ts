import { Component } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';
import { LienService, TabItem } from '@app/models';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum, ProductCategory } from '@app/models/enums';
import { ServiceBaseSectionComponent } from './service-base-section.component';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ModalService, PermissionService } from '@app/services';
import { LienServiceStatus } from '@app/models/enums/lien-service-status.enum';
import { ClaimantDetailsState } from '../state/reducer';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { DateFormatPipe, LienStatusPipe, ProductCategoryToStringPipe } from '@app/modules/shared/_pipes';
import { TabInfoState } from '@app/modules/shared/state/tab-info/state';
import { GenerateFinalStatusLetterModalComponent } from './generate-final-status-letter-modal/generate-final-status-letter-modal.component';

@Component({
  selector: 'app-medical-liens-section',
  styleUrls: ['./medical-liens-section.component.scss'],
  templateUrl: './medical-liens-section.component.html',
})

export class MedicalLiensSectionComponent extends ServiceBaseSectionComponent {
  entityType = EntityTypeEnum.LienPayment;
  protected tabTitles: { [key: number]: string; };
  public tabs: TabItem[];
  public item$ = this.store.select(selectors.item);
  public services$ = this.store.select(selectors.services);
  public actionBar$ = this.store.select(selectors.actionBar);

  public claimantId: number;
  // Action button for final status letter. Enabled only if the lien status is finalized.
  private lienStatusId: number;
  public actionBar: ActionHandlersMap = {
    finalStatusLetter: {
      callback: () => this.generateFinalStatusLetter(),
      disabled: () => this.lienStatusId !== LienServiceStatus.Finalized,
      permissions: [ PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.FinalStatusLetter) ],
    },
  };

  constructor(
    store: Store<ClaimantDetailsState>,
    route: ActivatedRoute,
    datePipe: DateFormatPipe,
    lienStatusPipe: LienStatusPipe,
    productCategoryPipe: ProductCategoryToStringPipe,
    tabInfoStore: Store<TabInfoState>,
    private modalService: ModalService,
  ) {
    super(store,route,datePipe,lienStatusPipe,productCategoryPipe,tabInfoStore);
  }

  ngOnInit() {
    super.ngOnInit();

    this.item$
      .pipe(
        filter(claimant => !!claimant),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(claimant => {
        this.claimantId = claimant.id;
      });

    this.services$
      .pipe(
        filter((services: LienService[]) => !!services),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((services: LienService[]) => {
        this.lienStatusId = services.find(service => service.id === ProductCategory.MedicalLiens).status.id;
        this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: this.actionBar }));
      });
  }

  protected generateFinalStatusLetter(): void {
    this.modalService.show(GenerateFinalStatusLetterModalComponent, { initialState: { claimantId: this.claimantId }, class: 'modal-md' });
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
  }
}
