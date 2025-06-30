import { Component, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Subject, filter, takeUntil } from "rxjs";
import { ClaimantDetailsState } from "../state/reducer";
import { ActivatedRoute } from "@angular/router";
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { ClaimantOverviewReleaseAdmin } from "@app/models/claimant-overview/claimant-overview-release-admin";
import { DateFormatPipe } from "@app/modules/shared/_pipes";
import { CurrencyHelper } from "@app/helpers";
import * as rootActions from '@app/state/root.actions';

@Component({
    selector: 'app-claimant-release-summary',
    templateUrl: './release-summary-tab.component.html',
    styleUrls: ['./release-summary-tab.component.scss'],
})
export class ReleaseSummaryTabComponent implements OnDestroy, OnInit {

    public readonly isReleaseOverviewLoaded$ = this.store.select(selectors.releaseOverviewItem);

    private readonly ngUnsubscribe$ = new Subject<void>();

    public overviewRelease: ClaimantOverviewReleaseAdmin;
    public allocation: string;
    public dateMailed: string;
    public releaseRec: string;
    public submittedToDefense: string;
    public defenseApprovalDate: string;

    constructor(
        private readonly store: Store<ClaimantDetailsState>,
        private readonly route: ActivatedRoute,
        private datePipe: DateFormatPipe
    ) {
    }

    ngOnInit(): void {
        this.store.dispatch(rootActions.LoadingStarted({ actionNames: [actions.GetClaimantOverviewRelease.type] }));

        this.route.parent.parent.parent.parent.params.pipe(
            filter(params => !!params),
            takeUntil(this.ngUnsubscribe$),
        ).subscribe(params => {
            this.store.dispatch(actions.GetClaimantOverviewRelease({ claimantId: params.id }));
        });

        this.isReleaseOverviewLoaded$.pipe(
            filter(overviewRelease => !!overviewRelease),
            takeUntil(this.ngUnsubscribe$),
        ).subscribe((overviewRelease: ClaimantOverviewReleaseAdmin) => {
            this.overviewRelease = overviewRelease;

            if (overviewRelease && overviewRelease.items && overviewRelease.items.length > 0) {
                this.allocation = CurrencyHelper.toUsdFormat({ value: this.overviewRelease.items[0].allocation }, true);
                this.dateMailed = this.datePipe.transform(this.overviewRelease.items[0].dateMailedToClaimant, false);
                this.releaseRec = this.datePipe.transform(this.overviewRelease.items[0].releaseRec, false);
                this.submittedToDefense = this.datePipe.transform(this.overviewRelease.items[0].submittedToDefense, false);
                this.defenseApprovalDate = this.datePipe.transform(this.overviewRelease.items[0].defenseApprovalDate, false);
            }

            this.store.dispatch(rootActions.LoadingFinished({ actionName: actions.GetClaimantOverviewRelease.type }));
        })
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }
}