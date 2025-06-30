/* eslint-disable */ 

/* eslint-disable @typescript-eslint/dot-notation */
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import FusionCharts from 'fusioncharts';

import * as Sentry from '@sentry/angular-ivy';

import { LicenseManager } from 'ag-grid-enterprise';
import { User } from '@sentry/angular-ivy';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { env } from 'process';

LicenseManager.setLicenseKey("Using_this_{AG_Grid}_Enterprise_key_{AG-063113}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{Archer_Systems,_LLC}_is_granted_a_{Single_Application}_Developer_License_for_the_application_{ARCHER_Connect}_only_for_{6}_Front-End_JavaScript_developers___All_Front-End_JavaScript_developers_working_on_{ARCHER_Connect}_need_to_be_licensed___{ARCHER_Connect}_has_not_been_granted_a_Deployment_License_Add-on___This_key_works_with_{AG_Grid}_Enterprise_versions_released_before_{5_August_2025}____[v3]_[01]_MTc1NDM0ODQwMDAwMA==4a82bf6f0b5ac20ae851db5b697c78fe");

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
FusionCharts.options['license']({
  key: 'hzH5vmaD8A1C5D2E1C2E1G1B4D2A3B1B3axxH2B7B2xD2C2E1mlF-7C11C2C7egvD4F3H3eD-16C-13F4E2D3F1G1I4B2C8E3E2B2rttB1B11GD1xG-10sG4A19A32bqD8ZB5G4ooxA9C5A5E7E6C5E4B1C3A11C3B6A4D2f==',
  creditLabel: false,
});

Sentry.init({
  dsn: environment.sentry_dsn,
  environment: environment.sentry_environment,
  maxBreadcrumbs: 5,
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ['localhost', /^\//],
      routingInstrumentation: Sentry.routingInstrumentation,

    }),
  ],
  tracesSampleRate: 1.0,
  release: environment.version,
  beforeSend(event, hint) {
    var user = JSON.parse(localStorage.getItem('user'));
    event.user = {};
    event.user.id = user.id.toString();
    event.user.email = user.email;
    event.user.username = user['username'];
    if (!event.tags) {
      event.tags = {};
    }
    event.tags["organization"] = `${user.defaultOrganization.name} (${user.defaultOrganization.id})`;
    event.tags["username"] = `${user['username']} (${user.id})`;

    // only show sentry dialog if it's turned on and this event is an error
    if (event.exception && environment.sentry_feedback) {
      Sentry.showReportDialog({ eventId: event.event_id, user: { name: user.displayName,  email: event.user.email }});
    }

    return event;
  },
});

if (environment.gtm) {
  const gtmScript = document.createElement('script');  
  gtmScript.src = `https://www.googletagmanager.com/gtag/js?id=${environment.gtm}`;
  document.head.appendChild(gtmScript);

  const gtagScript = document.createElement('script');
  gtagScript.appendChild(document.createTextNode(`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${environment.gtm}');`));
  document.head.appendChild(gtagScript);
}

//Reuse sentry_environment here just to not create another Environment variable for the same purpose.
if (environment.sentry_environment === 'Production') {
  const newRelicScript = document.createElement('script');
  newRelicScript.src = './assets/newRelic.js';
  newRelicScript.type = 'text/javascript';
  newRelicScript.async = false;
  document.head.appendChild(newRelicScript);
}

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));

  /* eslint-enable */
