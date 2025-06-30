import { Component, Input, OnInit } from "@angular/core";
import { ClaimantOverviewReleaseAdmin } from "@app/models/claimant-overview/claimant-overview-release-admin";
import * as fromRootActions from '@app/state/root.actions';
import * as fromShared from '@app/modules/shared/state';
import { Store } from "@ngrx/store";
import { ActivatedRoute } from "@angular/router";
import { InfoCardState } from "@app/models/enums/info-card-state.enum";
import { LienServiceStatus } from "@app/models/enums";
import { ReleasePhase } from "@app/models/enums/release-phase.enum";

@Component({
    selector: 'app-claimant-dashboard-release-admin',
    templateUrl: './claimant-dashboard-release-admin.component.html',
    styleUrls: ['../claimant-dashboard-services-summary.component.scss']
})
export class ClaimantDashboardReleaseAdminComponent implements OnInit {
    @Input() public releaseAdmin: ClaimantOverviewReleaseAdmin;

    protected isReleasePhaseRemoved: boolean;
    protected isFinalized: boolean;
    protected infoCardState: InfoCardState;

    constructor(
        private readonly store: Store<fromShared.AppState>,
        private readonly route: ActivatedRoute,
    ) { }

    ngOnInit(): void {
        this.isReleasePhaseRemoved = this.releaseAdmin.items[0].phaseId === ReleasePhase.Removed;
        this.isFinalized = this.releaseAdmin.service.status.id === LienServiceStatus.Finalized;
        this.infoCardState = this.getInfoCardState();
    }

    private getInfoCardState(): InfoCardState {
        if (this.isReleasePhaseRemoved) {
            return InfoCardState.Pending;
        }
        return this.isFinalized ? InfoCardState.Final : InfoCardState.Pending;
    }

    onClick(): void {
        this.route.parent.params.subscribe(params => {
            this.store.dispatch(fromRootActions.NavigateToUrl({ url: `/claimants/${params.id}/services/4` }));
        });

    }
}