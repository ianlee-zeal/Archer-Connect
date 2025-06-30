import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'https://archerc-ui.qa.s3betaplatform.com',
  },
  env: {
    apiHost: 'archerc-api.qa.s3betaplatform.com'
  }
});
