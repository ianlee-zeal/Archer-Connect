import { browser, logging } from 'protractor';

export class Helper {
    static user = {
        email: 'test@archersystems.com',
        password: 'password'
    }

    static checkLogs() {
        browser.manage().logs().get(logging.Type.BROWSER)
            .then(logs => {
                expect(logs).not.toContain(jasmine.objectContaining({
                    level: logging.Level.SEVERE,
                } as logging.Entry));
            });
    }
}