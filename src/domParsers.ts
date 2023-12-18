import * as fs from 'fs';
import { Page } from 'playwright';

export async function makeAllImageUrlList(page: Page, searchQuery: string, maxDownloadCount: number): Promise<string[]> {
    await page.fill("#tags", searchQuery);
    await page.click('button i.fa-solid.fa-magnifying-glass');
    await page.waitForSelector("#posts > div.paginator");

    const lastPageNumber = await getLastPageNumber(page);

    console.log(lastPageNumber + "pages exist");

    let allLargeFileUrls: string[] = [];
    for (let i = 1; i <= lastPageNumber; i++) {
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

async function getLastPageNumber(page: Page): Promise<number> {
    return await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('.numbered-page'));
        return elements.length === 0 ? 1 : parseInt(elements[elements.length - 1].textContent || "1");
    });
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

export async function saveUrlListToJson(largeFileUrls: string[], filename = 'urlList.json') {
    const jsonData = JSON.stringify(largeFileUrls, null, 2);
    fs.writeFileSync(filename, jsonData);
    console.log(`Saved URL list to ${filename}`);
}

export async function navigateToPage(page: Page, pageNumber: number): Promise<void> {
    const url = new URL(page.url());
    url.searchParams.set('page', pageNumber.toString());
    await page.goto(url.toString());
    console.log(`Navigated to page: ${pageNumber}`);
}

