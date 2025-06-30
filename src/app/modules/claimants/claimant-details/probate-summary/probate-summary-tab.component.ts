import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { ClaimantDetailsState } from "../state/reducer";
import * as selectors from '../state/selectors';
import { ActivatedRoute } from "@angular/router";
import * as actions from '../state/actions';
import { Subject, filter, takeUntil } from "rxjs";
import { CurrencyHelper } from "@app/helpers";
import { ClaimantOverviewProbate } from "@app/models/claimant-overview/claimant-overview-probate";
import * as rootActions from '@app/state/root.actions';

@Component({
    selector: 'app-probate-summary-tab',
    templateUrl: './probate-summary-tab.component.html',
    styleUrl: './probate-summary-tab.component.scss',
    changeDetection: ChangeDetectionStrategy.Default,
})
export class ProbateSummaryTabComponent implements OnInit, OnDestroy {

    public readonly isProbateOverviewLoaded$ = this.store.select(selectors.probateOverviewItems);

    private readonly ngUnsubscribe$ = new Subject<void>();

    public overviewProbates: ClaimantOverviewProbate[];
    public spiExist: string;
    public numPayees: string;
    public allocation: string;

    constructor(
        private readonly store: Store<ClaimantDetailsState>,
        private readonly route: ActivatedRoute,
    ) { }

    ngOnInit(): void {
        this.store.dispatch(rootActions.LoadingStarted({ actionNames: [actions.GetClaimantOverviewProbateItems.type] }));

        this.route.parent.parent.parent.parent.params.pipe(
            takeUntil(this.ngUnsubscribe$),
        ).subscribe(params => {
            this.store.dispatch(actions.GetClaimantOverviewProbateItems({ claimantId: params.id }));
        });

        this.isProbateOverviewLoaded$
            .pipe(
                filter(overviewProbates => !!overviewProbates),
                takeUntil(this.ngUnsubscribe$),
            ).subscribe(overviewProbates => {
                this.overviewProbates = overviewProbates;
                this.overviewProbates[0]?.spiExist == false ? this.spiExist = "No" : this.spiExist = "Yes"
                this.numPayees = this.overviewProbates[0]?.numPayees.toString();
                this.allocation = CurrencyHelper.toUsdFormat({ value: this.overviewProbates[0]?.allocation }, true);

                this.store.dispatch(rootActions.LoadingFinished({ actionName: actions.GetClaimantOverviewProbateItems.type }));

            });
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

}