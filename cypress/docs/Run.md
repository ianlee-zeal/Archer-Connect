# Run Cypress
### Prepare credentials
Create `cypress.env.json` with credentials inside `archer-app` folder.
```json
{
  "user_default": "sample_user",
  "user_default_password": "sample_password"
}
```
### Run locally
- Rename ```cypress/config.local.ts.example``` to ```cypress/config.local.ts```
- Run a dev server
```shell
npm run start:local
```
- Run cypress
```shell
npm run cypress:local:run // or npm run cypress:local:open
```
### Run for a remote server (qa, stage, etc.)
Run cypress
```shell
npm run cypress:<dev|qa|stage|...>:<open|run>
```
