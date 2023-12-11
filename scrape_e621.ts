import dotenv from 'dotenv';
import fs from 'fs';
import fetch from 'node-fetch';
import { chromium } from 'playwright';

dotenv.config();
const USER_NAME = process.env.USER_NAME;
const PASSWORD = process.env.PASSWORD;

async function login(url: string) {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url);

    if (await page.$("#guest-warning-accept")) {
        await page.click("#guest-warning-accept");
    }

    await page.click("#nav-sign-in-link");
    await page.fill("#name", USER_NAME || '');
    await page.fill("#password", PASSWORD || '');
    await page.click('input:text("Submit")');

    return page;
}

async function scrapeUrlWithPlaywright(page: any, query: string) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const articleTags = await page.$$("article");
    const largeFileUrls = await Promise.all(articleTags.map(async (tag: any) => tag.getAttribute("data-large-file-url")));

    return largeFileUrls;
}

async function downloadImages(largeFileUrls: string[]) {
    if (!fs.existsSync("./img")) {
        fs.mkdirSync("./img");
    }

    for (const [i, url] of largeFileUrls.entries()) {
        const response = await fetch(url);
        const buffer = await response.buffer();

        fs.writeFileSync(`./img/image_${i}.jpg`, buffer);
        console.log(`Downloaded ${url} as image_${i}.jpg`);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

async function main() {
    const initUrl = "https://e621.net/session/new";
    try {
        const page = await login(initUrl);
        const largeFileUrls = await scrapeUrlWithPlaywright(page, "");
        await downloadImages(largeFileUrls);
    } catch (e) {
        console.error("An error occurred:", e);
    }
}

main();
