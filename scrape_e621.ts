import dotenv from 'dotenv';
import fs from 'fs';
import { Browser, ElementHandle, Page, Response, chromium, } from 'playwright';

dotenv.config();
const USER_NAME = process.env.USER_NAME;
const PASSWORD = process.env.PASSWORD;

async function initializeBrowser(): Promise<[Browser, Page]> {
    const browser: Browser = await chromium.launch({ headless: false });
    const page: Page = await browser.newPage();
    return [browser, page];
}

async function login(page: Page, url: string): Promise<Page> {

    await page.goto(url);

    // R18 dialog
    if (await page.$("#guest-warning-accept")) {
        await page.click("#guest-warning-accept");
    }

    await page.click("#nav-sign-in-link");
    await page.fill("#name", USER_NAME || '');
    await page.fill("#password", PASSWORD || '');
    await page.click('input:text("Submit")');

    return page;
}

async function getAllImageUrl(page: Page, searchQuery: string): Promise<string[]> {

    // 検索クエリを入力して検索結果画面に遷移
    await page.click("#tags");
    await page.fill("#tags", searchQuery);
    await page.click('button i.fa-solid.fa-magnifying-glass');
    await page.waitForSelector("#posts > div.paginator");

    // 最後のnumbered-pageクラスのテキストを整数型で取得
    const lastNumberedPageNumber = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('.numbered-page'));
        if (elements.length === 0) {
            // numbered-pageクラスを持つ要素がない場合
            return 1;
        }

        const lastElement = elements[elements.length - 1];
        if (!lastElement) {
            // 最後の要素が存在しない場合
            return 1;
        }

        const link = lastElement.querySelector('a');
        if (link && link.textContent) {
            // リンクとテキストが存在する場合
            return parseInt(link.textContent);
        } else {
            // リンクが存在しない、またはテキストがない場合
            return 1;
        }
    });

    console.log(lastNumberedPageNumber); // コンソールに最後の要素を表示

    // 全てのURLを格納する配列
    let allLargeFileUrls = [];
    // forでクエリを書き換えてページネーション
    for (let i = 1; i <= lastNumberedPageNumber; i++) {
        const url: URL = new URL(page.url());
        url.searchParams.set('page', i.toString());
        await page.goto(url.toString()); // URLに移動
        console.log(`Current URL: ${page.url()}`); // 現在のURLをコンソールに表示

        // ここでページの内容を処理する（スクレイピング、情報の取得など）
        const articleTags = await page.$$("article");
        const largeFileUrls = await Promise.all(articleTags.map(async (tag: ElementHandle) => tag.getAttribute("data-large-file-url")));
        // 取得したURLを配列に追加
        allLargeFileUrls.push(...largeFileUrls.filter(url => url !== null));
    }
    return allLargeFileUrls.filter(url => url !== null) as string[];
}

async function downloadImages(page: Page, largeFileUrls: string[]) {
    if (!fs.existsSync("./img")) {
        fs.mkdirSync("./img");
    }

    for (const [i, url] of largeFileUrls.entries()) {
        const response: Response | null = await page.goto(url, { waitUntil: 'networkidle' });

        if (response) {
            const buffer: Buffer = await response.body();
            fs.writeFileSync(`./img/image_${i}.jpg`, buffer);
            console.log(`Downloaded ${url} as image_${i}.jpg`);
        } else {
            console.log(`Failed to download ${url}`);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}



async function main() {
    const initUrl = "https://e621.net/session/new";
    try {
        const [browser, page] = await initializeBrowser();
        await login(page, initUrl);
        const searchQuery: string = "your_search_query_here"
        const largeFileUrls = await getAllImageUrl(page, searchQuery);
        await downloadImages(page, largeFileUrls);
        await page.close();
        await browser.close();
        return;
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();
