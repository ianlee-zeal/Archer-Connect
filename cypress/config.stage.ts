import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'https://archerc-ui.stage.s3betaplatform.com',
  },
  env: {
    apiHost: 'archerc-api.stage.s3betaplatform.com'
  }
});
