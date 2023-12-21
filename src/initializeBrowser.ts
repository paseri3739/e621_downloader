import { Browser, Page, chromium } from "playwright";
import { PASSWORD, USER_NAME } from "./main";

export async function initializeBrowser(): Promise<[Browser, Page]> {
    const browser: Browser = await chromium.launch({ headless: true });
    const page: Page = await browser.newPage();
    return [browser, page];
}
export async function login(page: Page, url: string): Promise<Page> {
    await page.goto(url);

    // age dialog
    if (await page.$("#guest-warning-accept")) {
        await page.click("#guest-warning-accept");
    }

    await page.click("#nav-sign-in-link");
    await page.fill("#name", USER_NAME || "");
    await page.fill("#password", PASSWORD || "");
    await page.click('input:text("Submit")');
    await page.waitForTimeout(1000);
    return page;
}

export async function search(page: Page, searchQuery: string): Promise<Page> {
    await page.fill("#tags", searchQuery);
    await page.click("button i.fa-solid.fa-magnifying-glass");
    await page.waitForSelector("#posts > div.paginator");
    return page;
}
