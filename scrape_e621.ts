import 'dotenv/config';
import fs from 'fs';
import { Browser, ElementHandle, Page, Response, chromium, } from 'playwright';

const USER_NAME = process.env.USER_NAME;
const PASSWORD = process.env.PASSWORD;

async function initializeBrowser(): Promise<[Browser, Page]> {
    const browser: Browser = await chromium.launch({ headless: true });
    const page: Page = await browser.newPage();
    return [browser, page];
}

async function login(page: Page, url: string): Promise<Page> {

    await page.goto(url);

    // age dialog
    if (await page.$("#guest-warning-accept")) {
        await page.click("#guest-warning-accept");
    }

    await page.click("#nav-sign-in-link");
    await page.fill("#name", USER_NAME || '');
    await page.fill("#password", PASSWORD || '');
    await page.click('input:text("Submit")');
    await page.waitForTimeout(1000);
    return page;
}

function getLastNumberedPageNumber() {
    const elements = Array.from(document.querySelectorAll('.numbered-page'));
    if (elements.length === 0) {
        return 1;
    }

    const lastElement = elements[elements.length - 1];
    if (!lastElement) {
        return 1;
    }

    const link = lastElement.querySelector('a');
    if (link && link.textContent) {
        return parseInt(link.textContent);
    } else {
        return 1;
    }
}


async function getAllImageUrl(page: Page, searchQuery: string, maxDownloadCount: number): Promise<string[]> {

    await page.click("#tags");
    await page.fill("#tags", searchQuery);
    await page.waitForTimeout(1000);
    await page.click('button i.fa-solid.fa-magnifying-glass');
    await page.waitForSelector("#posts > div.paginator");

    const lastNumberedPageNumber = await page.evaluate(getLastNumberedPageNumber);

    console.log(lastNumberedPageNumber);

    let allLargeFileUrls = [];
    let currentCount = 0;
    for (let i = 1; i <= lastNumberedPageNumber; i++) {
        const url: URL = new URL(page.url());
        url.searchParams.set('page', i.toString());
        await page.waitForTimeout(1000);
        await page.goto(url.toString());
        console.log(`Current URL: ${page.url()}`);

        const articleTags = await page.$$("article");
        const largeFileUrls = await Promise.all(articleTags.map(async (tag: ElementHandle) => tag.getAttribute("data-large-file-url")));

        for (const url of largeFileUrls) {
            if (url !== null) {
                allLargeFileUrls.push(url);
                currentCount++;
                if (currentCount >= maxDownloadCount) {
                    console.log(`Reached max download count: ${maxDownloadCount}`);
                    return allLargeFileUrls;
                }
            }
        }
    }

    return allLargeFileUrls;
}

async function downloadImages(page: Page, largeFileUrls: string[], maxDownloadCount: number) {
    if (!fs.existsSync("./img")) {
        fs.mkdirSync("./img");
    }

    for (const [i, url] of largeFileUrls.entries()) {

        if (maxDownloadCount > 0 && i >= maxDownloadCount) {
            console.log(`Reached max download count: ${maxDownloadCount}`);
            break;
        }

        const response: Response | null = await page.goto(url, { waitUntil: 'networkidle' });

        if (response) {
            const buffer: Buffer = await response.body();
            fs.writeFileSync(`./img/image_${i}.jpg`, buffer);
            console.log(`Downloaded ${url} as image_${i}.jpg`);
        } else {
            console.log(`Failed to download ${url}`);
        }

        await new Promise(resolve => setTimeout(resolve, 2500));
    }
}

async function main() {
    const initUrl = "https://e621.net/session/new";

    const searchQuery = process.argv[2];

    if (!searchQuery) {
        console.error("No search query provided. Usage: node app.js <search_query>");
        process.exit(1);
    }

    let maxDownloadCount = Infinity;
    if (process.argv[3]) {
        const parsedCount = parseInt(process.argv[3], 10);

        if (isNaN(parsedCount) || parsedCount < 0) {
            console.error("Invalid argument: Max download count must be a non-negative integer.");
            return;
        }

        maxDownloadCount = parsedCount;
    }

    try {
        const [browser, page] = await initializeBrowser();
        await login(page, initUrl);
        const largeFileUrls = await getAllImageUrl(page, searchQuery, maxDownloadCount);
        await downloadImages(page, largeFileUrls, maxDownloadCount);
        await page.close();
        await browser.close();
        return;
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();
