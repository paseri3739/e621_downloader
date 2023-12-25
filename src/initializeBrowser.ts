import * as fs from "fs";
import { Browser, BrowserContext, Page, chromium } from "playwright";
import { PASSWORD, USER_NAME } from "./main";

export async function initializeBrowser(gui: boolean): Promise<[Browser, Page, BrowserContext]> {
    const homePage: string = "https://e621.net/posts";
    const statePath = "./loginAuth.json";
    // if not option provided, headless set to false by commander
    const browser: Browser = await chromium.launch({ headless: !gui });

    let context: BrowserContext;
    let page: Page;

    if (fs.existsSync(statePath)) {
        // ストレージ状態が存在する場合、それを使用して新しいコンテキストを作成
        context = await browser.newContext({ storageState: statePath });
        page = await context.newPage();
        await page.goto(homePage);
    } else {
        // ストレージ状態が存在しない場合、新しいコンテキストを作成してログイン処理を実行
        context = await browser.newContext();
        page = await context.newPage();
        await login(page);
    }

    return [browser, page, context];
}
export async function login(page: Page): Promise<Page> {
    const loginUrl = "https://e621.net/session/new";
    await page.goto(loginUrl);

    // age dialog
    if (await page.$("#guest-warning-accept")) {
        await page.click("#guest-warning-accept");
    }

    await page.click("#nav-sign-in-link");
    await page.fill("#name", USER_NAME || "");
    await page.fill("#password", PASSWORD || "");
    await page.click('input:text("Submit")');
    await page.waitForTimeout(1000);
    await page.context().storageState({ path: "./loginAuth.json" });
    return page;
}

export async function search(page: Page, searchQuery: string): Promise<Page> {
    await page.fill("#tags", searchQuery);
    await page.click("button i.fa-solid.fa-magnifying-glass");
    await page.waitForSelector("#posts > div.paginator");
    return page;
}
