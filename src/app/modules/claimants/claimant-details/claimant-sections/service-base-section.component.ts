import { OnInit, OnDestroy, Directive } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, withLatestFrom, takeUntil } from 'rxjs/operators';

import { LienServiceStatus } from '@app/models/enums';
import { ClientWorkflow } from '@app/models';
import { LienStatusPipe, DateFormatPipe, ProductCategoryToStringPipe } from '@app/modules/shared/_pipes';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { Claimant } from '@app/models/claimant';
import { SectionContainingTabsComponent } from '@app/modules/shared/_abstractions/section-containing-tabs.component';
import { TabInfoState } from '@app/modules/shared/state/tab-info/state';
import { DateHelper } from '@app/helpers/date.helper';
import { ProductCategory } from '../../../../models/enums/product-category.enum';
import { ClaimantDetailsState } from '../state/reducer';

import * as actions from '../state/actions';
import * as fromClaimants from '../state/selectors';

@Directive()
export abstract class ServiceBaseSectionComponent extends SectionContainingTabsComponent implements OnInit, OnDestroy {
  private claimant$ = this.store.select(fromClaimants.item);
  private claimant: Claimant;
  private clientWorkflow$ = this.store.select(fromClaimants.clientWorkflow);
  private headerElements$ = this.store.select(fromClaimants.headerElements);

  private headerElements: ContextBarElement[] = [];
  private serviceHeaderElements: ContextBarElement[];

  constructor(
    public store: Store<ClaimantDetailsState>,
    public route: ActivatedRoute,
    private datePipe: DateFormatPipe,
    private lienStatusPipe: LienStatusPipe,
    private productCategoryPipe: ProductCategoryToStringPipe,
    tabInfoStore: Store<TabInfoState>,
  ) {
    super(tabInfoStore);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.addClaimantListener();
    this.addClientWorkflowListener();
  }

  private addClaimantListener(): void {
    this.claimant$
      .pipe(
        filter(claimant => !!claimant),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(claimant => {
        const claimantId = claimant.id;
        this.claimant = claimant;
        const productCategoryId = +this.route.snapshot.url[0].path;

        this.store.dispatch(actions.GetClaimantWorkflow({ productCategoryId, claimantId }));
      });
  }

  private addClientWorkflowListener(): void {
    this.clientWorkflow$
      .pipe(
        withLatestFrom(this.headerElements$),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(([clientWorkflow, headerElements]) => {
        this.serviceHeaderElements = this.getServiceHeaderElements(clientWorkflow);

        if (!this.headerElements.length) {
          this.headerElements = headerElements ?? [];
        }
        this.store.dispatch(actions.UpdateHeader({
          headerElements: [
            ...this.headerElements,
            ...this.serviceHeaderElements],
        }));
      });
  }

  private getServiceHeaderElements(clientWorkflow: ClientWorkflow): ContextBarElement[] {
    const workflowElements: ContextBarElement[] = [];
    const productCategoryId = +this.route.snapshot.url[0].path;

    if (clientWorkflow && productCategoryId === ProductCategory.Probate) {
      if (clientWorkflow.phase && clientWorkflow.stage) {
        workflowElements.splice(0);
        workflowElements.push({
          column: 'Phase: Stage',
          valueGetter: () => (`${clientWorkflow.phase.name}: ${clientWorkflow.stage.name}`),
        });
      }
      return workflowElements;
    }

    if (this.claimant && clientWorkflow && productCategoryId === ProductCategory.MedicalLiens) {
      workflowElements.push({
        column: clientWorkflow.stage?.isFinal
          ? this.lienStatusPipe.transform(LienServiceStatus.Finalized)
          : this.lienStatusPipe.transform(LienServiceStatus.Pending),
        valueGetter: () => (`Reported final: ${DateHelper.toMonthDayYearFormatString(this.claimant.finalizedDate) || 'No'}`),
      });
    }

    if (clientWorkflow) {
      workflowElements.push(
        {
          column: `Stage of ${this.productCategoryPipe.transform(productCategoryId)}`,
          valueGetter: () => (clientWorkflow.stage?.isFinal
            ? this.lienStatusPipe.transform(LienServiceStatus.Finalized)
            : this.lienStatusPipe.transform(LienServiceStatus.Pending)),
        },
        { column: 'Last Updated Date', valueGetter: () => (this.datePipe.transform(clientWorkflow.lastModifiedDate)) },

      );
    }

    return workflowElements;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(actions.UpdateHeader({ headerElements: this.headerElements }));
  }
}
