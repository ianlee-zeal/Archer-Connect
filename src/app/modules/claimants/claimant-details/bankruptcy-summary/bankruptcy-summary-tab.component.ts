import { Component, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { ClaimantDetailsState } from "../state/reducer";
import * as selectors from '../state/selectors';
import { ActivatedRoute } from "@angular/router";
import { Subject, filter, takeUntil } from "rxjs";
import * as actions from '../state/actions';
import { CurrencyHelper } from "@app/helpers";
import { ClaimantOverviewBankruptcy } from "@app/models/claimant-overview/claimant-overview-bankruptcy";
import { DateFormatPipe, YesNoPipe } from "@app/modules/shared/_pipes";
import * as rootActions from '@app/state/root.actions';

@Component({
    selector: 'app-claimant-bankruptcy-summary',
    templateUrl: './bankruptcy-summary-tab.component.html',
    styleUrls: ['./bankruptcy-summary-tab.component.scss'],
})
export class BankruptcySummaryTabComponent implements OnDestroy, OnInit {

    public readonly isBankruptcyOverviewLoaded$ = this.store.select(selectors.bankruptcyOverviewItems);

    private readonly ngUnsubscribe$ = new Subject<void>();

    public overviewBankruptcies: ClaimantOverviewBankruptcy[];
    public spiExist: string;
    public allocation: string;
    public abandoned: string;
    public closingStatementNeeded: string;
    public finalDate: string;
    public readyToPayTrustee: string;
    public attorneyAmount: string;
    public claimantAmount: string;
    public trusteeAmount: string;
    public bkFee: string;

    constructor(
        private readonly store: Store<ClaimantDetailsState>,
        private readonly route: ActivatedRoute,
        private yesNoPipe: YesNoPipe,
        private datePipe: DateFormatPipe,
    ) {
    }

    ngOnInit(): void {
        this.store.dispatch(rootActions.LoadingStarted({ actionNames: [actions.GetClaimantOverviewBankruptcyItems.type] }));

        this.route.parent.parent.parent.parent.params.pipe(
            filter(params => !!params),
            takeUntil(this.ngUnsubscribe$),
        ).subscribe(params => {
            this.store.dispatch(actions.GetClaimantOverviewBankruptcyItems({ claimantId: params.id }));
        });

        this.isBankruptcyOverviewLoaded$.pipe(
            filter(overviewBankruptcies => !!overviewBankruptcies),
            takeUntil(this.ngUnsubscribe$),
        ).subscribe((overviewBankruptcies: ClaimantOverviewBankruptcy[]) => {
            this.overviewBankruptcies = overviewBankruptcies;

            if(overviewBankruptcies && overviewBankruptcies.length > 0)
            {
                this.spiExist = this.overviewBankruptcies[0].spiExist === null ? "N/A" : (this.overviewBankruptcies[0].spiExist ? "Yes" : "No");

                this.abandoned = this.yesNoPipe.transform(this.overviewBankruptcies[0].abandoned);
                this.closingStatementNeeded = this.yesNoPipe.transform(this.overviewBankruptcies[0].closingStatementNeeded);
                this.readyToPayTrustee = this.yesNoPipe.transform(this.overviewBankruptcies[0].readyToPayTrustee);
                this.finalDate = this.datePipe.transform(this.overviewBankruptcies[0].finalDate, false, null, null, true)

                this.allocation = CurrencyHelper.toUsdFormat({ value: this.overviewBankruptcies[0].allocation }, true);
                this.trusteeAmount = CurrencyHelper.toUsdFormat({ value: this.overviewBankruptcies[0].trusteeAmount }, true);
                this.attorneyAmount = CurrencyHelper.toUsdFormat({ value: this.overviewBankruptcies[0].attorneyAmount }, true);
                this.claimantAmount = CurrencyHelper.toUsdFormat({ value: this.overviewBankruptcies[0].claimantAmount }, true);
                this.bkFee = CurrencyHelper.toUsdFormat({ value: this.overviewBankruptcies[0].bkFee }, true);
            }

            this.store.dispatch(rootActions.LoadingFinished({ actionName: actions.GetClaimantOverviewBankruptcyItems.type }));
        });
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

}