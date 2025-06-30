import { Component, Input, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { PowerBIReportEmbedComponent } from 'powerbi-client-angular';
import { IReportEmbedConfiguration, models, service, Embed } from 'powerbi-client';
import { PowerBiConfigModel } from '@app/services/power-bi-config.model';


@Component({
    selector: 'app-power-bi',
    templateUrl: './power-bi.component.html',
    styleUrls: ['./power-bi.component.scss'],
    providers: []
})
export class PowerBIComponent implements OnInit {
    // Pass as input an observable from the Power BI Service
    @Input() powerBiConfig$: Observable<PowerBiConfigModel>;

    // Wrapper object to access report properties
    @ViewChild(PowerBIReportEmbedComponent) reportObj!: PowerBIReportEmbedComponent;

    private unsubscribe$: Subject<void> = new Subject<void>();

    // CSS Class to be passed to the wrapper
    reportClass = 'report-container';

    // Flag which specify the type of embedding
    phasedEmbeddingFlag = false;

    // Pass the basic embed configurations to the wrapper to bootstrap the report on first load
    // Values for properties like embedUrl, accessToken and settings will be set on click of button

    // pageNavigation visible: true allows the use of tab navigation within the report
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

    constructor() { }

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges) {
        if(changes['powerBiConfig$'] && this.powerBiConfig$){
            this.powerBiConfig$.pipe(
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
    }

    setActivePage(pageName: string) {
        this.reportObj?.getReport().setPage(pageName).catch(() => { });
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}