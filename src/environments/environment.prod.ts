// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  real_production: true,
  showLogs: false,
  isUat: false,
  api_url: 'https://api.archerconnect.com/api',
  help_url: 'https://api.archerconnect.com/help',
  hangfire_url: 'https://api.archerconnect.com/jobs',
  user_role_type_id: 2,
  sts_server: 'https://login.archerconnect.com',
  lpm_url: 'https://lpm.lienteam.com',
  pusher_key: 'e3848f59bce5c2d09bab',
  pusher_cluster: 'mt1',
  sentry_dsn: 'https://e514877a0f0f4b6dbd34c4f4e23e942a@o475152.ingest.sentry.io/5512994',
  sentry_environment: 'Production',
  sentry_feedback: false,
  version: '4.6',
  gtm: 'G-XXZXGTBB63',
  master_org_name: 'ARCHER Systems, LLC',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
