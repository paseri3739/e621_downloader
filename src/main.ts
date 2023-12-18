import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { makeAllImageUrlList, saveUrlListToJson } from './domParsers';
import { initializeBrowser, login } from './initializeBrowser';
import { downloadImages } from './io';

export const USER_NAME = process.env.USER_NAME;
export const PASSWORD = process.env.PASSWORD;

function parseCommandLineArguments() {
    return process.argv.includes('--save-url');
}

function showUsageAndExit() {
    const usage = `Usage: node ${path.basename(__filename)} <search_query> [--max-download-count <count>] [--save-url]
    <search_query>                : specify search query
    --max-download-count <count>  : specify maximum download number (optional)
    --save-url                    : save json temp file (optional)`;
    console.log(usage);
    process.exit(1);
}

async function main() {
    const initUrl = "https://e621.net/session/new";
    const tempFilename = 'urlList.json';
    const searchQuery = process.argv[2];
    const saveUrl = parseCommandLineArguments();

    if (process.argv.length < 3) {
        showUsageAndExit();
    }
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
        const largeFileUrls = await makeAllImageUrlList(page, searchQuery, maxDownloadCount);

        // save url as json
        await saveUrlListToJson(largeFileUrls, tempFilename);

        await downloadImages(page, largeFileUrls, maxDownloadCount);

        // --save-url が指定されていない場合のみ、一時ファイルを削除
        if (!saveUrl) {
            fs.unlinkSync(tempFilename);
            console.log(`Deleted temporary file: ${tempFilename}`);
        }

        await page.close();
        await browser.close();
        return;
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();
