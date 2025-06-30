import { Component, OnInit, ViewChild} from '@angular/core';
import { PowerBiConfigService } from '@app/services/api/power-bi-config.service';
import { Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { PowerBIReportEmbedComponent } from 'powerbi-client-angular';
import { IReportEmbedConfiguration, models, service, Embed } from 'powerbi-client';
import { PowerBiConfigModel } from '@app/services/power-bi-config.model';
import { Store } from '@ngrx/store';
import * as fromAuth from '@app/modules/auth/state';
import { RootState } from '@app/state/root.state';
import * as selectors from '@app/modules/projects/state/selectors';
import { ContextBarElement } from '@app/entities/context-bar-element';


@Component({
    selector: 'app-claims-power-bi',
    templateUrl: './claims-power-bi.component.html',
    styleUrls: ['./claims-power-bi.component.scss'],
    providers: []
})
export class ClaimsPowerBIComponent implements OnInit {
    // Wrapper object to access report properties
    @ViewChild(PowerBIReportEmbedComponent) reportObj!: PowerBIReportEmbedComponent;

    private unsubscribe$: Subject<void> = new Subject<void>();

    public readonly user$ = this.store.select(fromAuth.authSelectors.getUser);
    public readonly contextBar$ = this.store.select(selectors.contextBar);

    // CSS Class to be passed to the wrapper
    reportClass = 'report-container';

    // Flag which specify the type of embedding
    phasedEmbeddingFlag = false;

    // Pass the basic embed configurations to the wrapper to bootstrap the report on first load
    // Values for properties like embedUrl, accessToken and settings will be set on click of button

    // pageNavigation visible: false prevents the user from changing the pages in the report
    // set default page to 'Claims' when report loads
    reportConfig: IReportEmbedConfiguration = {
        id: undefined,
        embedUrl: undefined,
        accessToken: undefined,
        tokenType: models.TokenType.Embed,
        pageName: undefined,
        settings: {
            panes: {
                pageNavigation: {
                    visible: true
                }
            },
            layoutType: models.LayoutType.Custom,
            customLayout: {
                displayOption: models.DisplayOption.FitToWidth,
            },
        },
        type: "report",
    };
    /**
     * Map of event handlers to be applied to the embedded report
     */
    // Update event handlers for the report by redefining the map using this.eventHandlersMap
    // Set event handler to null if event needs to be removed
    // More events can be provided from here
    // https://docs.microsoft.com/en-us/javascript/api/overview/powerbi/handle-events#report-events
    eventHandlersMap = new Map([
        ['loaded', () => {
            const report = this.reportObj?.getReport();
            report.setComponentTitle('Embedded report');
            report.getPages().then(pages => { console.log(pages); });
            console.log('Report has loaded');
            // matches page with menu item;
            // May turn this into a setting elsewhere
            // this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'We are aware of a data refresh issue and we are actively working on a solution.', life: 5000 });
        },
        ],
        ['rendered', () => console.log('Report has rendered')],
        ['error', (event?: service.ICustomEvent<any>) => {
            if (event) {
                console.error(event.detail);
            }
        },
        ],
        ['visualClicked', () => console.log('visual clicked')],
        ['pageChanged', event => console.log(event)],
    ]) as Map<string, (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null>;

    private projectId: number;

    constructor(private powerBiConfigService: PowerBiConfigService, private router: Router, private readonly store: Store<RootState>) { }

    ngOnInit() {
        this.contextBar$.pipe(
            takeUntil(this.unsubscribe$),
          )
          .subscribe((contextBar: ContextBarElement[]) => {
            if (contextBar) {
              this.projectId = Number(contextBar.find(obj => obj.column == "ID").valueGetter());
              this.powerBiConfigService.getEmbeddedReportConfig(this.projectId).pipe(
                  takeUntil(this.unsubscribe$),
                  filter((item: PowerBiConfigModel) => item != null)
              )
                  .subscribe((result: PowerBiConfigModel) => {
                      // reassign so it's picked up by change detection

                      this.reportConfig = {
                          ...this.reportConfig,
                          accessToken: result.embedToken.token,
                          id: result.embedReport[0].reportId,
                          embedUrl: result.embedReport[0].embedUrl
                      };

                  });
            }
          });

    }
    setActivePage(pageName: string) {
        this.reportObj?.getReport().setPage(pageName).catch(() => { });
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}