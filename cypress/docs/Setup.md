# Setup Cypress
Installation guide: https://docs.cypress.io/guides/getting-started/installing-cypress

## Install on Windows
In case of Windows system it's enough to run
`npm install` or `npm ci`. Cypress will be installed along with other project's dependencies. 

## Install on Linux (Ubuntu/Debian)
For linux-systems we'll need to have some more dependencies:
```shell
sudo apt update
sudo apt upgrade
sudo apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
```
