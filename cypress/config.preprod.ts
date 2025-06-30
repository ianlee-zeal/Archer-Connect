import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'https://archerc-ui.preprod.s3betaplatform.com',
  },
  env: {
    apiHost: 'archerc-api.preprod.s3betaplatform.com'
  }
});
