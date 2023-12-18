import 'dotenv/config';
import fs from 'fs';
import { Browser, Page, chromium } from 'playwright';

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

async function getAllImageUrl(page: Page, searchQuery: string, maxDownloadCount: number): Promise<string[]> {
    await page.type("#tags", searchQuery);
    await page.click('button i.fa-solid.fa-magnifying-glass');
    await page.waitForSelector("#posts > div.paginator");

    const lastNumberedPageNumber = await getLastNumberedPageNumber(page);

    console.log(lastNumberedPageNumber);

    let allLargeFileUrls = [];
    for (let i = 1; i <= lastNumberedPageNumber; i++) {
        await navigateToPage(page, i);
        const pageUrls = await extractLargeFileUrlsFromPage(page);
        allLargeFileUrls.push(...pageUrls);

        if (allLargeFileUrls.length >= maxDownloadCount) {
            console.log(`Reached max download count: ${maxDownloadCount}`);
            break;
        }
    }

    return allLargeFileUrls.slice(0, maxDownloadCount);
}

async function getLastNumberedPageNumber(page: Page): Promise<number> {
    return await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('.numbered-page'));
        return elements.length === 0 ? 1 : parseInt(elements[elements.length - 1].textContent || "1");
    });
}

async function navigateToPage(page: Page, pageNumber: number): Promise<void> {
    const url = new URL(page.url());
    url.searchParams.set('page', pageNumber.toString());
    await page.goto(url.toString());
    console.log(`Navigated to page: ${pageNumber}`);
}

async function extractLargeFileUrlsFromPage(page: Page): Promise<string[]> {
    const articleTags = await page.$$("article");
    const urls = await Promise.all(
        articleTags.map(async (tag) => {
            const url = await tag.getAttribute("data-large-file-url");
            return url || undefined; // nullの場合はundefinedに置き換え
        })
    );
    return urls.filter((url): url is string => url !== undefined); // undefinedを除外
}



async function writeImage(page: Page, url: string, index: number) {
    const response = await page.goto(url, { waitUntil: 'networkidle' });

    if (response) {
        const buffer = await response.body();
        fs.writeFileSync(`./img/image_${index}.jpg`, buffer);
        console.log(`Downloaded ${url} as image_${index}.jpg`);
    } else {
        console.log(`Failed to download ${url}`);
    }
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

        await writeImage(page, url, i);

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
