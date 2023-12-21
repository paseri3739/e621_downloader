import "dotenv/config";
import * as fs from "fs";
import { parseArguments } from "./commandline";
import { makeAllImageUrlList, saveUrlListToJson } from "./domParsers";
import { initializeBrowser, login, search } from "./initializeBrowser";
import { downloadImages } from "./io";

export const USER_NAME = process.env.USER_NAME;
export const PASSWORD = process.env.PASSWORD;

async function main() {
    const initUrl = "https://e621.net/session/new";
    const tempFilename = "urlList.json";
    const { searchQuery, maxDownloadCount, recoveryFrom, saveUrl } = parseArguments();

    try {
        const [browser, page] = await initializeBrowser();
        await login(page, initUrl);
        await search(page, searchQuery);
        const largeFileUrls = await makeAllImageUrlList(page, maxDownloadCount);
        await saveUrlListToJson(largeFileUrls, tempFilename);
        await downloadImages(page, largeFileUrls, maxDownloadCount, recoveryFrom);

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
