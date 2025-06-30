import { ForgotPasswordPage } from './forgot-password.po';
import { Helper } from '../..//helper';

describe("Positive test cases for 'Forgot password' page", () => {
    let page: ForgotPasswordPage;

    beforeAll(() => {
        page = new ForgotPasswordPage();
        page.navigateTo();
    });

    afterEach(async () => {
        await Helper.checkLogs();
    });

    it("should display forgot password title", () => {
        expect(page
            .getTitleText())
            .toEqual("Please enter your registered email address.");
    });

    it("should fill email", () => {
        page.setEmail(Helper.user.email);
        expect(page.getEmail()).toEqual(Helper.user.email);
    });

    it("should has 'Send email' button", () => {
        expect(page.getSubmitButton().isPresent()).toBeTruthy();
    });
});